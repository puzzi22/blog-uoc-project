import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private defaultLanguage = 'en';
  public currentLanguage: string; // declare the property

  constructor(private translate: TranslateService) {
    // initialize the property in the constructor
    this.currentLanguage =
      this.translate.getDefaultLang() || this.defaultLanguage;
  }

  public setLanguage(language: string) {
    this.translate.use(language);
    this.currentLanguage = language; // update the currentLanguage property
  }

  public getLanguage(): string {
    return this.currentLanguage;
  }
}
