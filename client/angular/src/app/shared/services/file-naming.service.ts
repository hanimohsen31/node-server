import { Injectable, Injector } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class FileNamingService {
  fileNameFormate(reportName: string = "Downloaded File") {
    const currentTime = new Date();
    const formattedTime = `${currentTime.getFullYear()}-${(currentTime.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${currentTime.getDate().toString().padStart(2, "0")}[${currentTime
      .getHours()
      .toString()
      .padStart(2, "0")}-${currentTime.getMinutes().toString().padStart(2, "0")}-${currentTime
      .getSeconds()
      .toString()
      .padStart(2, "0")}]`;
    return `${reportName.toLocaleUpperCase()}_${formattedTime}`;
  }
}
