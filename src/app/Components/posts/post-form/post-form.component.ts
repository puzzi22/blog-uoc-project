import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
  title: UntypedFormControl;
  description: UntypedFormControl;
  publication_date: UntypedFormControl;
  // categories: UntypedFormControl;
  categories: string[] = [];

  selectedCategories: CategoryDTO[] = [];

  // categories: CategoryDTO[];

  postForm: UntypedFormGroup;
  isValidForm: boolean | null;

  private isUpdateMode: boolean;
  private validRequest: boolean;
  private postId: string | null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private postService: PostService,
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private sharedService: SharedService,
    private localStorageService: LocalStorageService,
    private categoryService: CategoryService
  ) {
    this.isValidForm = null;
    this.postId = this.activatedRoute.snapshot.paramMap.get('id');
    this.post = new PostDTO('', '', 0, 0, new Date());
    this.isUpdateMode = !!this.postId;
    this.validRequest = false;
    this.selectedCategories = [];

    this.categories = [];

    this.title = new UntypedFormControl('', [
      Validators.required,
      Validators.maxLength(55),
    ]);

    this.description = new UntypedFormControl('', [
      Validators.required,
      Validators.maxLength(255),
    ]);

    this.publication_date = new UntypedFormControl('', [Validators.required]);

    // this.categories = new UntypedFormControl('', [Validators.required]);

    this.postForm = this.formBuilder.group({
      title: this.title,
      description: this.description,
      publication_date: this.publication_date,
      // categories: this.categories,
      categoryFormArray: this.formBuilder.array([]),
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

  loadCategories(): void {
    const user_id = localStorage.getItem('user_id');
    if (user_id) {
      this.categoryService
        .getCategoriesByUserId(user_id)
        .then((categories: CategoryDTO[]) => {
          // Extract the category ids from the categories array
          const ids: string[] = categories.map(
            (category: CategoryDTO) => category.categoryId
          );
          this.categories = ids;
          const post = new PostDTO('', '', 0, 0, new Date());
          post.categories = this.categories;
          // Use the new post object to create or update a post
        })
        .catch((error) => {
          console.log(error); // Handle the error as required
        });
    }
  }
  // async loadCategories() {
  //   const userId = this.activatedRoute.snapshot.paramMap.get('userId');
  //   if (userId) {
  //     try {
  //       const categories = await this.categoryService.getCategoriesByUserId(
  //         userId
  //       );
  //       console.log(categories);
  //       this.categories = categories;
  //     } catch (error: any) {
  //       this.sharedService.errorLog(error);
  //     }
  //   }
  // }

  // async loadCategories() {
  //   const userId = this.localStorageService.get('user_id');
  //   if (userId) {
  //     try {
  //       const categories = await this.categoryService.getCategoriesByUserId(
  //         userId
  //       );
  //       for (const category of this.categories) {
  //         this.categoryFormArray.controls[category.categoryId].patchValue(
  //           category
  //         );
  //       }
  //     } catch (error: any) {
  //       this.sharedService.errorLog(error);
  //     }
  //   }
  // }

  onCategoryChange(event: any) {
    const selectedCategories = [];
    const options = event.target.options;

    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedCategories.push(options[i].value);
      }
    }

    this.post.categories = selectedCategories;
  }

  ngOnInit(): void {
    this.loadCategories();
    // this.getCategoriesByUserId(userId);
  }

  // getCategoriesByUserId(userId: string): Promise<CategoryDTO[]> {
  //   return this.http
  //     .get<CategoryDTO[]>('http://localhost:3000/users/categories/' + userId)
  //     .toPromise();
  // }

  private async editPost(): Promise<boolean> {
    let errorResponse: any;
    let responseOK: boolean = false;

    if (this.postId) {
      const userId = this.localStorageService.get('user_id');
      if (userId) {
        this.post.userId = userId;
        if (this.selectedCategories.length > 0) {
          this.post.categories = this.selectedCategories
            .map((category) => category.categoryId)
            .map((categoryId) => ({ categoryId } as CategoryDTO)); // Convert to CategoryDTO array
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
      if (this.selectedCategories.length > 0) {
        this.post.categories = this.selectedCategories
          .map((category) => category.categoryId)
          .map((categoryId) => ({ categoryId } as CategoryDTO)); // Convert to CategoryDTO array
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
