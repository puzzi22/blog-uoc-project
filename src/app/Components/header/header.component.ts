import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { HeaderMenus } from 'src/app/Models/header-menus.dto';
import { HeaderMenusService } from 'src/app/Services/header-menus.service';
import { LanguageService } from 'src/app/Services/language.service';
import { LocalStorageService } from 'src/app/Services/local-storage.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  showAuthSection: boolean;
  showNoAuthSection: boolean;

  showLanguageOptions = false;

  constructor(
    private router: Router,
    private headerMenusService: HeaderMenusService,
    private localStorageService: LocalStorageService,
    private translate: TranslateService,
    public languageService: LanguageService
  ) {
    this.showAuthSection = false;
    this.showNoAuthSection = true;
  }

  switchLanguage(lang: string) {
    this.translate.use(lang);
    this.languageService.currentLanguage = lang; // save the current language selection
  }

  get currentLanguage() {
    return this.languageService.currentLanguage; // retrieve the current language selection
  }

  ngOnInit(): void {
    this.headerMenusService.headerManagement.subscribe(
      (headerInfo: HeaderMenus) => {
        if (headerInfo) {
          this.showAuthSection = headerInfo.showAuthSection;
          this.showNoAuthSection = headerInfo.showNoAuthSection;
        }
      }
    );
  }

  home(): void {
    this.router.navigateByUrl('home');
  }

  login(): void {
    this.router.navigateByUrl('login');
  }

  register(): void {
    this.router.navigateByUrl('register');
  }

  adminPosts(): void {
    this.router.navigateByUrl('posts');
  }

  adminCategories(): void {
    this.router.navigateByUrl('categories');
  }

  profile(): void {
    this.router.navigateByUrl('profile');
  }

  logout(): void {
    // TODO 15
    const headerInfo: HeaderMenus = {
      showAuthSection: false,
      showNoAuthSection: true,
    };

    this.localStorageService.remove('user_id');
    this.localStorageService.remove('access_token');
    this.headerMenusService.headerManagement.next(headerInfo);
    this.router.navigateByUrl('home');
  }
}
