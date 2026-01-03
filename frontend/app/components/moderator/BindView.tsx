import React, { useEffect, useState } from "react";
import { AnimeInfo, } from "@/app/types/Anime_types"
import AnimeEntry from "../AnimeEntry";
import Bind, { BindRequestInfo } from "./Bind";

interface BindViewProps {
    bindRequests: BindRequestInfo[],
    setBindRequests: (bindRequests: BindRequestInfo[]) => void,
}

const BindView: React.FC<BindViewProps> = ({ bindRequests, setBindRequests }) => {

    const removeBindRequest = (index: number) => {
        setBindRequests(bindRequests.filter((_, i) => i !== index));
    }

    return (
        <div className="flex flex-col min-h-96 bg-foreground rounded-2xl w-full p-4 gap-4">
            {
                bindRequests.map((r, index) => {
                    return (
                        <Bind
                            info={r}
                            postAccept={(info) => removeBindRequest(index)}
                            postDeny={(info) => removeBindRequest(index)}
                            key={index}>
                        </Bind>
                    );
                })}
        </div>
    )
}

export default BindView;