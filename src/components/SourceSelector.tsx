import {EProviders} from "@/configs";
import React from "react";

type TSourceSelectorProps = {
    provider: EProviders;
    onChange: (provider: EProviders) => void;
}

export const SourceSelector = ({provider, onChange}: TSourceSelectorProps) => (
    <select
        value={provider}
        onChange={(e) => onChange(e.target.value as EProviders)}
        className="w-full p-2 border border-gray-300 rounded-2xl shadow-2xl focus:outline-none focus:border-gray-400 transition-all"
    >
        {
            Object.values(EProviders).map((provider) => (
                <option key={provider} value={provider}>{provider}</option>
            ))
        }
    </select>
)
