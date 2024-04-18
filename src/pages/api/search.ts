import type {NextApiRequest, NextApiResponse} from "next";
import {Unbody} from "@unbody-io/ts-client";
import {EProviders} from "@/configs";
import {DiscordSearchItem, GDocSearchItem, TextBlockSearchItem} from "@/types";

type Data = GDocSearchItem[] | DiscordSearchItem[] | TextBlockSearchItem[];

const u = new Unbody({
    apiKey: process.env.UNBODY_API_KEY!,
    projectId: process.env.UNBODY_PROJECT_ID!,
});

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>,
) {
    const {query, provider} = req.body;

    switch (provider) {
        case EProviders.GoogleDoc: {
            const {data: {payload}} = await u.get.googleDoc
                .select("title", "text")
                .search
                .about(query)
                .exec();
            return res.status(200).json(payload);
        }
        case EProviders.DiscordMassage: {
            const {data: {payload}} = await u.get.discordMessage
                .select("content")
                .search
                .about(query, {certainty: 0.7})
                .exec();
            return res.status(200).json(payload);
        }
        case EProviders.TextBlock: {
            const {data: {payload}} = await u.get.textBlock
                .select("html")
                .where(({NotEqual, And, ContainsAny}) => {
                    return And(
                        {tagName: NotEqual("h1")},
                        {tagName: NotEqual("h2")},
                        {tagName: NotEqual("h3")},
                        {classNames: NotEqual("title")},
                    )
                })
                .search
                .about(query, {certainty: 0.6})
                .exec();
            return res.status(200).json(payload);
        }
        default: {
            return res.status(400);
        }
    }
}
