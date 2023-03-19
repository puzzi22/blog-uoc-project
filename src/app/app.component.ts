import { Component } from '@angular/core';
import { LanguageService } from './Services/language.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(private languageService: LanguageService) {}

  title = 'blog-uoc-project-front';

  setLanguage(language: string) {
    this.languageService.setLanguage(language);
  }

  ngOnInit() {
    const lang = this.languageService.getLanguage();
    this.languageService.setLanguage(lang);
  }
}
