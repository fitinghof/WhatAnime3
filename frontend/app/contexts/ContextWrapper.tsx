import { SettingsProvider } from "./SettingsContext"
import { SongContextProvider } from "./SongContext"
import { ReportContextProvider } from "./ReportContext"
import { UserContextProvider } from "./UserContext"

interface ContextsProps {
    children: React.ReactNode
}

const Contexts: React.FC<ContextsProps> = ({ children }) => {
    return (
        <UserContextProvider>
            <SongContextProvider>
                <SettingsProvider>
                    <ReportContextProvider>
                        {children}
                    </ReportContextProvider>
                </SettingsProvider>
            </SongContextProvider>
        </UserContextProvider>
    )
}

export default Contexts;