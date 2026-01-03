import React, { useContext } from "react";
import AnimeEntry, { AnimeEntryConfig } from "./AnimeEntry";
import { AnimeInfo } from "../types/Anime_types";
import { useSettings } from "../contexts/SettingsContext";
import { Settings } from "../contexts/SettingsContext";
import { Seperator } from "../util/utility";


interface AnimeListProps {
    seperator: string | null,
    animes: AnimeInfo[];
    list_config: ListConfig;
}

export interface ListConfig {
    show_confirm_button: boolean,
    after_anime_bind: () => void,
    open_report_window: (anime_ann_id: number) => void,
}

function visible(anime: AnimeInfo, list_config: Settings): boolean {
    const { index_type } = anime.bind.song_index;

    return (
        (index_type === "Ending" && list_config.showEndings) ||
        (index_type === "Opening" && list_config.showOpenings) ||
        (index_type === "Insert" && list_config.showInserts)
    );
}

const AnimeList: React.FC<AnimeListProps> = ({ animes, list_config, seperator }) => {
    const { settings } = useSettings();
    let anime_config: AnimeEntryConfig =
    {
        show_report_button: true,
        show_confirm_button: list_config.show_confirm_button,
        language: settings.language,
        after_anime_bind: list_config.after_anime_bind,
        open_report_window: list_config.open_report_window
    };

    let animes_filtered = animes.filter(value => visible(value, settings));
    animes_filtered.sort((a, b) => {
        const score_a = a.anime.mean_score ?? 0;
        const score_b = b.anime.mean_score ?? 0;
        return score_b - score_a;
    })
    const lineStyle = "flex-1 h-[3px] bg-[#555] rounded-md";
    return (
        <>
            {animes_filtered.length != 0 && (
                <>
                    <div className="flex justify-center items-center px-4 w-full mx-auto my-1 gap-1 font-bold">
                        <div className={lineStyle}></div>
                        <span className="px-2 text-base">{seperator}</span>
                        <div className={lineStyle}></div>
                    </div>

                    <div className="flex flex-row flex-wrap gap-4 items-start">
                        {
                            animes_filtered.map((anime, index) => (
                                <AnimeEntry key={index} anime={anime} config={anime_config} />
                            ))
                        }
                    </div>
                </>
            )
            }
        </>
    );
};

export default AnimeList;
