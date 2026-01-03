"use client"
import { useEffect, useState } from "react";
import { AnimeEntryConfig } from "@/app/components/AnimeEntry"
import { AnimeInfo } from "@/app/types/Anime_types"
import HeaderContainer, { SongInfo } from "@/app/components/HeaderContainer"
import AnimeList, { ListConfig } from "./components/AnimeList";

import { Update } from "./types/fetch_types";
import { useSongContext } from "./contexts/SongContext";
import { useReportContext } from "./contexts/ReportContext";
import ReportOverlay from "./overlays/ReportOverlay";


interface List {
  header: string,
  anisongs: Array<AnimeInfo>
}
interface FetchOutput {
  song_info: SongInfo,
  certainty: number,
  lists: Array<List>
}


export default function Home() {
  const [lists, setlists] = useState<Array<{ header: string, anisongs: Array<AnimeInfo> }>>([]);
  const { songInfo, setSongInfo } = useSongContext();
  const { reportData } = useReportContext();

  const defaultListConfig: ListConfig = {
    open_report_window: () => { },
    after_anime_bind: () => { },
    show_confirm_button: true,
  }

  const [listConfig, setListConfig] = useState<ListConfig>(defaultListConfig)

  const UpdateData = (forceRefresh: boolean) => {
    handleUpdateFetch(forceRefresh).then(data => {

      if (data != undefined) {
        if (data == "not_playing") {
          setSongInfo({ ...songInfo, song_name: "Not Playing" })
        } else {
          setlists(data.lists);
          setSongInfo(data.song_info);
          setListConfig({ ...listConfig, show_confirm_button: data.certainty < 100 })
        }
      }
    });
  }

  useEffect(() => {
    UpdateData(true);
    const interval = setInterval(() => {
      UpdateData(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [])
  return (
    <>
      <div className="relative flex flex-col font-sans bg-background m-4 gap-4 min-w-60">
        {reportData.visible && (
          <ReportOverlay></ReportOverlay>
        )}
        <HeaderContainer></HeaderContainer>
        {lists.map((a, index) => {
          return (
            <AnimeList key={index} animes={a.anisongs} seperator={a.header} list_config={listConfig} ></AnimeList>
          )
        })}
      </div>
    </>
  );
}

async function handleUpdateFetch(forceRefresh: boolean): Promise<FetchOutput | undefined | "not_playing"> {
  return await fetch(
    `/api/update?refresh=${forceRefresh}`
  ).then(r => r.json().then((data: Update) => {
    if (typeof data === "string") {
      console.log(data);
      switch (data) {
        case "login_required": {
          window.location.href = "/api/login";
          break;
        }
        case "unauthorized":
        case "no_updates":
          return undefined;
        case "not_playing":
          return "not_playing";
      }

      return undefined;
    } else {
      console.log("new_song");
      const song_info = data.new_song.song_info;
      const anisongs = data.new_song.anisongs;
      let certainty = 0;
      let lists: Array<List> = [];
      if ("hit" in anisongs) {
        certainty = anisongs.hit.certainty;
        lists.push({
          header: `Match ${anisongs.hit.certainty}%`,
          anisongs: anisongs.hit.hits
        })
        lists.push({
          header: `More by artists`,
          anisongs: anisongs.hit.more_by_artists
        })
      } else {
        lists.push({
          header: `Possible matches`,
          anisongs: anisongs.miss.possible
        })
      }

      const output: FetchOutput = {
        song_info: song_info,
        lists: lists,
        certainty: certainty,
      }
      return output;
    }
  }));
}