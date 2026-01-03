import React from "react";
import { json } from "stream/consumers";

export async function makeBindRequest(song_id: number, spotify_id: string) {
    const bind_data = {
        song_id: song_id,
        spotify_song_id: spotify_id,
    };
    const response = await fetch("/api/make_bind_request",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(bind_data)
        }
    );
    console.log(await response.text());
    console.log(response.status);
    return response.status;
}


interface ListEntryProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

const ListEntry: React.FC<ListEntryProps> = ({ children, className = "", ...rest }) => {
    return (
        <div
            className={`flex flex-row flex-grow basis-[440px] gap-2
                 rounded-2xl p-3 justify-between bg-no-repeat bg-cover 
                 bg-center bg-foreground break-words min-w-60 shadow-md ${className}`}
            {...rest}
        >
            {children}
        </div>
    );
};

export default ListEntry;


export function generateSeperator(text: string, color: string = "#555", height: number = 2, textSize: number = 14) {
    const lineStyle = {
        backgroundColor: color,
        height: `${height}px`,
        flex: 1,
    };
    return (
        <div className="flex items-center justify-center px-4 w-full mx-auto my-1.5 gap-1 text-[14px] font-bold">
            <div style={lineStyle}></div>
            {(text != "") && (<span className="px-2">{text}</span>)}
            <div style={lineStyle}></div>
        </div>
    )
}

interface SeperatorProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export const Seperator: React.FC<SeperatorProps> = ({ children, className = "", ...rest }) => {
    return (
        <div className={`flex items-center justify-center px-4 w-full mx-auto my-1.5 gap-3 font-bold`}>
            <div className="h-1 flex-grow bg-white">
                <div className={`${className}`}></div>
            </div>
            {children}
            <div className={`bg-foreground h-1 flex-grow ${className}`}></div>
        </div>
    )
};

interface RenderIfSomeProp extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}
export const RenderIfSome: React.FC<RenderIfSomeProp> = ({ children, className = "", ...rest }) => {
    if (!children) return null;

    return (
        <div className={className}
            {...rest}
        >
            {children}
        </div>
    );
}

