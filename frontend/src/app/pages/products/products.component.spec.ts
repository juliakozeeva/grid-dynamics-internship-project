import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductsComponent } from './products.component';
import { AppModule } from 'src/app/app.module';
import { CartService, FavouritesService, Query, UrlQuery } from 'src/app/shared/services';
import { CardProduct } from 'src/app/shared/models';
import { of } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';

describe('ProductsComponent', () => {
  let component: ProductsComponent;
  let fixture: ComponentFixture<ProductsComponent>;

  const routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl', 'navigate']);
  const cartServiceSpy = jasmine.createSpyObj('CartService', ['addToCart']);
  const favouritesServiceSpy = jasmine.createSpyObj('FavouritesService', ['addToFavourites']);
  const productFilterServiceSpy = jasmine.createSpyObj('ProductFilterService', ['resetSearchQuery']);

  const activatedRouteSpy = {
    queryParams: of({
      search: 'adadad'
    })
  };


  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppModule],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: CartService, useValue: cartServiceSpy },
        { provide: FavouritesService, useValue: favouritesServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
      ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(ProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('#showDetails should call router.navigateByUrl', () => {
    const stubId = 'stub';
    component.showDetails(stubId);
    expect(routerSpy.navigateByUrl).toHaveBeenCalled();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith(`/product/${stubId}`);
  });

  it('#addToCart should call cartService.addToCart', () => {
    const stubCard: CardProduct = {
      id: '1',
      title: 'title',
      quantity: 1,
      price: 100,
      image: {
        '1_1': '',
        '4_3': '',
        '16_9': '',
        'scale': '',
        'default': '',
      },
      size: 'stub',
      color: 'stub',
    };
    component.addToCart(stubCard);
    expect(cartServiceSpy.addToCart).toHaveBeenCalled();
    expect(cartServiceSpy.addToCart).toHaveBeenCalledWith(stubCard);
  });

  it('#addToFavourites should call favouritesService.addToFavourites', () => {
    const stubCard: CardProduct = {
      id: '1',
      title: 'title',
      quantity: 1,
      price: 100,
      image: {
        '1_1': '',
        '4_3': '',
        '16_9': '',
        'scale': '',
        'default': '',
      },
      size: 'stub',
      color: 'stub',
    };
    component.addToFavourites(stubCard);
    expect(favouritesServiceSpy.addToFavourites).toHaveBeenCalled();
    expect(favouritesServiceSpy.addToFavourites).toHaveBeenCalledWith(stubCard);
  });

  it('#createNewUrl should return string value', () => {
    const query: Query = {
      filter: {
        search: 'stub'
      },
      paging: {}
    };
    const result = component.createNewUrl(query);
    expect(result).toBe('/products?search=stub&');
  });

  it('#createQueryFromUrlQuery should return value', () => {
    const urlQuery: UrlQuery = {
      category: 'Stub'
    };
    const result = component.createQueryFromUrlQuery(urlQuery);
    const expectedQuery: Query = {
      filter: {
        category: 'Stub'
      },
      paging: {
        limit: 9
      }
    };
    expect(result).toEqual(expectedQuery);
  });

  it('#loadMore should call router.navigateByUrl', () => {
    component.loadMore();
    expect(routerSpy.navigateByUrl).toHaveBeenCalled();
  });

  it('#newBrands should call router.navigateByUrl', () => {
    component.newBrands([]);
    expect(routerSpy.navigateByUrl).toHaveBeenCalled();
  });

  it('#newSizes should call router.navigateByUrl', () => {
    component.newSizes([]);
    expect(routerSpy.navigateByUrl).toHaveBeenCalled();
  });

  it('#newPriceRange should call router.navigateByUrl', () => {
    component.newPriceRange([1, 2]);
    expect(routerSpy.navigateByUrl).toHaveBeenCalled();
  });

  it('#newCategory should call router.navigateByUrl', () => {
    component.newCategory(['']);
    expect(routerSpy.navigateByUrl).toHaveBeenCalled();
  });
});
