"use client"
import { useState, use, useEffect } from "react";
import ReportView from "@/app/components/moderator/ReportsView"
import BindView from "../components/moderator/BindView";
import { BindRequestInfo } from "../components/moderator/Bind";
import { UserReport } from "../components/moderator/Report";


type ActiveAction = "Reports" | "Binds" | "Database"

export interface ModeratorData {
    bind_requests: Array<BindRequestInfo>,
    reports: Array<UserReport>,
}

export default function Home() {
    const [moderatorData, setModeratorData] = useState<ModeratorData>({ bind_requests: [], reports: [] });

    useEffect(() => {
        fetch("/api/get_moderator").then(a => a.json().then((data: ModeratorData) => {
            setModeratorData(data);
            console.log(data);
        }));
    }, [])

    const [activeAction, setActiveAction] = useState<ActiveAction>("Reports")
    const buttonClass = "flex flex-row flex-1 rounded-xl p-4 justify-center min-w-26 transition hover:scale-105"
    return (
        <div className="flex flex-col flex-wrap font-sans bg-background gap-4 m-4">
            <div className="flex flex-row flex-wrap w-full gap-4">
                <button
                    className={buttonClass + " bg-foreground"}
                    onClick={() => { window.location.href = "/" }}
                >
                    <div className={`font-semibold text-md`}
                    >
                        Back
                    </div>
                </button>
                <button
                    className={buttonClass + activeButtonBackground("Reports")}
                    onClick={() => setActiveAction("Reports")}
                >
                    <div className={`font-semibold text-md`}
                    >
                        Reports
                    </div>
                </button>
                <button
                    className={buttonClass + activeButtonBackground("Binds")}
                    onClick={() => setActiveAction("Binds")}
                >
                    <div className="font-semibold text-md">Binds</div>
                </button>
                <button
                    className={buttonClass + activeButtonBackground("Database")}
                    onClick={() => setActiveAction("Database")}
                >
                    <div className="font-semibold text-md">Database</div>
                </button>
            </div>
            {
                test(activeAction)
            }
        </div>
    );

    function test(activeAction: ActiveAction) {
        switch (activeAction) {
            case "Binds":
                return <BindView
                    bindRequests={moderatorData.bind_requests}
                    setBindRequests={(newBinds) => setModeratorData({ ...moderatorData, bind_requests: newBinds })}>
                </BindView>
            case "Database":
                return <></>;
            case "Reports":
                return <ReportView
                    reports={moderatorData.reports}
                    setReports={(newReports: Array<UserReport>) => setModeratorData({ ...moderatorData, reports: newReports })}>
                </ReportView>
        }
        return (<></>)
    }

    function activeButtonBackground(active_on: ActiveAction) {
        return activeAction === active_on ? " bg-confirm_green" : " bg-foreground";
    }
}

