import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { from } from 'rxjs';
import { CategoryDTO } from 'src/app/Models/category.dto';
import { PostDTO } from 'src/app/Models/post.dto';
import { CategoryService } from 'src/app/Services/category.service';
import { LocalStorageService } from 'src/app/Services/local-storage.service';
import { PostService } from 'src/app/Services/post.service';
import { SharedService } from 'src/app/Services/shared.service';

@Component({
  selector: 'app-post-form',
  templateUrl: './post-form.component.html',
  styleUrls: ['./post-form.component.scss'],
})
export class PostFormComponent implements OnInit {
  post: PostDTO;
  title: FormControl;
  description: FormControl;
  publication_date: FormControl;
  allCategories!: CategoryDTO[];

  selectedCategories = new FormControl([]);

  postForm: FormGroup;
  isValidForm: boolean | null;

  private isUpdateMode: boolean;
  private validRequest: boolean;
  private postId: string | null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private postService: PostService,
    private formBuilder: FormBuilder,
    private router: Router,
    private sharedService: SharedService,
    private localStorageService: LocalStorageService,
    private categoryService: CategoryService,
    private translate: TranslateService
  ) {
    this.isValidForm = null;
    this.postId = this.activatedRoute.snapshot.paramMap.get('id');
    this.post = new PostDTO('', '', 0, 0, new Date());
    this.isUpdateMode = !!this.postId;
    this.validRequest = false;

    this.allCategories = [];
    this.loadCategories();

    this.title = new FormControl('', [
      Validators.required,
      Validators.maxLength(55),
    ]);

    this.description = new FormControl('', [
      Validators.required,
      Validators.maxLength(255),
    ]);

    this.publication_date = new FormControl('', [Validators.required]);

    this.postForm = this.formBuilder.group({
      title: this.title,
      description: this.description,
      publication_date: this.publication_date,
      selectedCategories: this.selectedCategories,
    });

    if (this.isUpdateMode) {
      // Fetch the post data from the backend API
      from(this.postService.getPostById(this.postId ?? '')).subscribe(
        (post: PostDTO) => {
          // Use the fetched data to initialize the form controls
          this.title.setValue(post.title);
          this.description.setValue(post.description);
          this.publication_date.setValue(
            formatDate(post.publication_date, 'yyyy-MM-dd', 'en')
          );
        }
      );
    }
  }
  // TODO 13

  ngOnInit(): void {}

  private async loadCategories(): Promise<void> {
    let errorResponse: any;
    const userId = this.localStorageService.get('user_id');
    if (userId) {
      try {
        this.allCategories = await this.categoryService.getCategoriesByUserId(
          userId
        );
      } catch (error: any) {
        errorResponse = error.error;
        this.sharedService.errorLog(errorResponse);
      }
    }
  }

  private async editPost(): Promise<boolean> {
    let errorResponse: any;
    let responseOK: boolean = false;

    if (this.postId) {
      const userId = this.localStorageService.get('user_id');
      if (userId) {
        this.post.userId = userId;
        if (
          this.selectedCategories.value != null &&
          this.selectedCategories.value.length > 0
        ) {
          this.post.categories = this.selectedCategories.value;
        }

        try {
          await this.postService.updatePost(this.postId, this.post);
          responseOK = true;
        } catch (error: any) {
          errorResponse = error.error;
          this.sharedService.errorLog(errorResponse);
        }

        await this.sharedService.managementToast(
          'postFeedback',
          responseOK,
          errorResponse
        );

        if (responseOK) {
          this.router.navigateByUrl('posts');
        }
      }
    }
    return responseOK;
  }

  private async createPost(): Promise<boolean> {
    let errorResponse: any;
    let responseOK: boolean = false;

    const userId = this.localStorageService.get('user_id');
    if (userId) {
      this.post.userId = userId;

      if (
        this.selectedCategories.value != null &&
        this.selectedCategories.value.length > 0
      ) {
        this.post.categories = this.selectedCategories.value;
      }

      try {
        await this.postService.createPost(this.post);
        responseOK = true;
      } catch (error: any) {
        errorResponse = error.error;
        this.sharedService.errorLog(errorResponse);
      }

      await this.sharedService.managementToast(
        'postFeedback',
        responseOK,
        errorResponse
      );

      if (responseOK) {
        this.router.navigateByUrl('posts');
      }
    }

    return responseOK;
  }

  async savePost() {
    this.isValidForm = false;

    if (this.postForm.invalid) {
      return;
    }

    this.isValidForm = true;
    this.post = this.postForm.value;

    if (this.isUpdateMode) {
      this.validRequest = await this.editPost();
    } else {
      this.validRequest = await this.createPost();
    }
  }
}
