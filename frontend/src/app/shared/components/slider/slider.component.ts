import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subscription, interval, combineLatest } from 'rxjs';
import { map, share } from 'rxjs/operators';

import { ProductsService, CartService } from '../../services';
import { Product, Image } from '../../models';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderComponent implements OnInit, OnDestroy {
  public readonly current$ = new BehaviorSubject<number>(0);
  public currentProduct$: Observable<Product>;
  public products$: Observable<Product[]>;

  private productChangerSubscription: Subscription;

  constructor(
    private readonly productsService: ProductsService,
    private readonly cartService: CartService,
    private readonly router: Router,
    private readonly sanitizer: DomSanitizer,
  ) { }

  ngOnInit() {
    this.products$ = this.productsService.getProductsForSlider()
      .pipe(map(response => {
        if (response && Array.isArray(response.data)) {
          return response.data;
        }

        return [];
      }))
      .pipe(share());

    this.currentProduct$ = combineLatest(this.current$, this.products$) // @TODO depricated
      .pipe(map(([slideNumber, products]) => products[slideNumber]));

    // this.productChangerSubscription = combineLatest(interval(7000), this.products$)
    // .pipe(map(([_, products]) => products ? products.length : 0))
    // .subscribe(productsNumber => {
    //   const possibleNext = this.current$.value + 1;

    //   const next = possibleNext < productsNumber
    //     ? possibleNext
    //     : 0;

    //   this.current$.next(next);
    // });
  }

  ngOnDestroy() {
    // this.productChangerSubscription.unsubscribe();
  }

  public readonly changeSlide = (newCurrent: number) => {
    this.current$.next(newCurrent);
  }

  public orderProduct(
    productId: string,
    productTitle: string,
    productPrice: number,
    image: Image,
    size: string,
    color: string,
  ) {
    this.cartService.addToCart({
      id: productId,
      title: productTitle,
      price: productPrice,
      quantity: 1,
      image: image,
      size: size,
      color: color,
    });
  }

  public showDetails(productId: string) {
    this.router.navigateByUrl(`/product/${productId}`);
  }

  public trustStyle(style: string) {
    this.sanitizer.bypassSecurityTrustStyle(style);
  }
}
