import React, { useEffect, useState } from "react";
import Report, { UserReport } from "./Report";

interface ReportViewProps {
    reports: Array<UserReport>
    setReports: (reports: Array<UserReport>) => void,
}

const ReportView: React.FC<ReportViewProps> = ({ reports, setReports }) => {

    const removeReport = (index: number) => {
        setReports(reports.filter((_, i) => i !== index));
    }

    return (
        <div className="flex flex-col min-h-96 bg-foreground rounded-2xl w-full p-4 gap-4">
            {
                reports.map((r, index) => {
                    return (
                        <Report
                            report={r}
                            key={index}>
                        </Report>
                    );
                })}
        </div>
    )

}

export default ReportView;