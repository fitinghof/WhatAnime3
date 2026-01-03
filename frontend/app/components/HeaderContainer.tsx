import ListEntry from "../util/utility";
import { useSongContext } from "../contexts/SongContext";
import { useSettings, useShowSettings } from "../contexts/SettingsContext";

export interface SongInfo {
    song_name: string; // Name of the song
    romanized_song_name: string,
    song_artists: string[]; // List of song artists
    romanized_artists: string[],
    album_image: string; // URL for the album image
    spotify_song_id: string; // Spotify track ID
}

interface HeaderContainerProps {
}

const HeaderContainer: React.FC<HeaderContainerProps> = ({ }) => {
    const { songInfo, setSongInfo } = useSongContext();
    const { settings } = useSettings();
    const { setShowSettings } = useShowSettings();
    const iconClass = "relative min-w-20 w-20 aspect-square rounded-xl bg-no-repeat bg-cover"
    return (
        <div className="flex-row">
            <ListEntry>
                <img
                    className={iconClass}
                    src={songInfo.album_image ? songInfo.album_image : "/amq_icon_green.svg"}
                    alt="Album cover"
                    onError={(e) => {
                        e.currentTarget.src = "/amq_icon_green.svg"; // Fallback to SVG
                    }}
                />
                <div className="w-full flex flex-col justify-center">
                    <h1 className="text-center text-lg font-semibold">
                        {songInfo ? (settings.romanizeSongInfo ? songInfo.romanized_song_name : songInfo.song_name) : "No song info"}
                    </h1>
                    <p className="text-center text-white text-md">
                        {songInfo ? (settings.romanizeSongInfo ? songInfo.romanized_artists.join(", ") : songInfo.song_artists.join(", ")) : ""}
                    </p>
                </div>
                <button
                    className={"relative min-w-20 w-20 bg-cover aspect-square bg-no-repeat rounded-2xl bg-cover hover:bg-white/20 bg-center"}
                    style={{ backgroundImage: `url(settings.svg)`, backgroundSize: 100 }}
                    onClick={() => setShowSettings(true)}>
                </button>
            </ListEntry>
        </div>
    );
}

export default HeaderContainer;