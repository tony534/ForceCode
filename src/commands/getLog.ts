import * as vscode from 'vscode';
import { IForceService } from './../forceCode';
import { QueryResult } from '../services/dxService';
const moment: any = require('moment');

interface LogRecord {
    Id: string;
    LogLength: string;
    Request: string;
    Status: string;
    DurationMilliseconds: string;
    StartTime: string;
    Location: string;
}

export default function getLog(context: vscode.ExtensionContext) {
    // Login, then get Identity info, 
    //  then get info about the logs and ask the user which one to open, 
    //  then get the log and show it
    return vscode.window.forceCode.connect(context)
        .then(getLast10Logs)
        .then(displayOptions)
        .then(showLog)
        .catch(err => vscode.window.forceCode.outputError(err, vscode.window.forceCode.outputChannel));

    function getLast10Logs(force: IForceService): Promise<QueryResult> {

        var queryString: string = `SELECT Id, LogLength, Request, Status, DurationMilliseconds, StartTime, Location FROM ApexLog` +
            ` WHERE LogUserId='${force.dxCommands.orgInfo.userId}'` +
            // ` AND Request = 'API' AND Location = 'SystemLog'` +
            // ` AND Operation like '%executeAnonymous%'`
            ` ORDER BY StartTime DESC, Id DESC LIMIT 10`;

        return force.dxCommands.toqlQuery(queryString);
    }

    function displayOptions(results: QueryResult): Thenable<vscode.QuickPickItem> {
        var options: vscode.QuickPickItem[] = results.records.map((record: LogRecord) => {
            return {
                label: `Status: ${record.Status}`,
                detail: `Start: ${moment(record.StartTime).format('dddd, MMMM Do YYYY, h:mm:ss a')}, Bytes: ${record.LogLength}`,
                description: record.Id,
            };
        });
        return vscode.window.showQuickPick(options);
    }

    function showLog(res) {
        if (vscode.window.forceCode.config.showTestLog) {
            return vscode.window.forceCode.dxCommands.getAndShowLog(res.description);
        }
        return res;
    }
}


