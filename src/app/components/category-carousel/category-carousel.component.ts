import { Component, OnInit, Input } from '@angular/core';
import { Category, CategoryService } from '@apttus/ecommerce';
import { map } from 'rxjs/operators';
import { map as _map, set, some} from 'lodash';
import { Observable } from 'rxjs';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-category-carousel',
  templateUrl: './category-carousel.component.html',
  styleUrls: ['./category-carousel.component.scss']
})
export class CategoryCarouselComponent implements OnInit {


  index: number = 0;
  view$: Observable<CategoryView>;
  @Input() modalRef: ModalDirective;

  constructor(private categoryService: CategoryService) { }

  ngOnInit() {
    this.view$ = this.categoryService.getCategoryTree()
      .pipe(
        map(categoryTree => {
          return {
            categoryTree: categoryTree,
            categoryBranch: _map(categoryTree, (c) => {
              const depth = this.getDepth(c);
              return new Array<any>(depth);
            })
          };
        })
      )
  }

  getDepth(obj) {
    let depth = 0;
    if (obj.Children) {
      obj.Children.forEach(d => {
        const tmpDepth = this.getDepth(d);
        if (tmpDepth > depth) {
          depth = tmpDepth;
        }
      });
    }
    return 1 + depth;
  }

  goToCategory(category: Category, view: CategoryView) {
    if(!some(view.categoryBranch, {'Id': category.Id})){
      set(view, `categoryBranch[${this.index}]`, category);
      this.index += 1;
    }
  }

  goBack(view: CategoryView, category: Category){
    setTimeout(() => {
      if(some(view.categoryBranch, {'Id': category.Id})) {
        this.index -= 1;
        this.index = (this.index < 0) ? 0 : this.index;
        set(view, `categoryBranch[${this.index}]`, new Category());
      }
    }, 500)
  }
}

interface CategoryView{
  categoryTree: Array<Category>;
  categoryBranch: Array<Category>;
}
