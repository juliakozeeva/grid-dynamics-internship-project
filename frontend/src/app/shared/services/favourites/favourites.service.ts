import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

import { CardProduct } from '../../models';
import { NotificationService } from '../notification/notification.service';
import { LocalizationService } from '../localization/localization.service';
import { localStorageFavouritesKey } from '../../constants';
import { apiHost } from '../../../../environments/environment';
import { AuthenticationService } from '../authentication/authentication.service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class FavouritesService {
  public readonly items$: Observable<CardProduct[]>;
  private readonly items = new BehaviorSubject<CardProduct[]>([]);

  constructor(
    private readonly authService: AuthenticationService,
    private readonly notificationService: NotificationService,
    private readonly localizationService: LocalizationService,
    private readonly http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: any,
  ) {
    this.items$ = this.items.asObservable();
    this.init();
  }

  init() {
    const itemsFromLocalStorage = this.getItemsFromLocalStorage();

    if (itemsFromLocalStorage) {
      this.items.next(itemsFromLocalStorage);
    }
  }

  async addToFavourites(cardProduct: CardProduct) {
    const idx = this.findIndexSameCardProduct(cardProduct);

    if (idx === -1) {
      const updatedItems = [
        ...this.items.value,
        cardProduct
      ];

      this.saveItemsToLocalStorage(updatedItems);

      this.items.next(updatedItems);
      if (this.authService.currentUserValue) {
        this.updateFavouritesItems();
      }

      const message = await this.localizationService.get('favourites.addToFavourites').toPromise();
      this.notificationService.info(`${cardProduct.title} ${message}`);
    }
  }

  getListOfFavourites() {
    const list = this.items.value;

    return list;
  }

  private findIndexSameCardProduct(cardProduct: CardProduct) {
    for (let i = 0; i < this.items.value.length; i++) {
      const item = this.items.value[i];
      if (item.id === cardProduct.id) {
        return i;
      }
    }

    return -1;
  }

  async deleteFromFavourites(product: CardProduct) {
    const updatedItems = [
      ...this.items.value.filter(el => el.id !== product.id)
    ];

    this.saveItemsToLocalStorage(updatedItems);

    this.items.next(updatedItems);
    this.updateFavouritesItems();

    const message = await this.localizationService
      .get('favourites.deleteFromFavourites').toPromise();
    this.notificationService.warning(`${product.title} ${message}`);
  }

  async clearFavourites() {
    const updatedItems = [];

    this.saveItemsToLocalStorage(updatedItems);

    this.items.next(updatedItems);
    this.updateFavouritesItems();

    const message = await this.localizationService.get('favourites.clearFavourites').toPromise();
    this.notificationService.warning(message);
  }

  private getItemsFromLocalStorage(): CardProduct[] | null {
    let localStorageData: string|null = null;
    if (isPlatformBrowser(this.platformId)) {
      localStorageData = localStorage.getItem(localStorageFavouritesKey);
    }

    if (!localStorageData) {
      return null;
    }

    try {
      const data = JSON.parse(localStorageData);

      if (Array.isArray(data)) {
        return data;
      }
    } catch (e) { }

    return null;
  }

  private saveItemsToLocalStorage(items: CardProduct[]): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(localStorageFavouritesKey, JSON.stringify(items));
    }
  }

  public sendNewFavouritesItems() {
    const address = `${apiHost}/api/favourites`;
    const body = { newItems: this.items.getValue() };
    const options = { withCredentials: true };

    return this.http.patch<any>(address, body, options)
      .subscribe(response => {
        this.saveItemsToLocalStorage(response.items);
        this.items.next(response.items);
      });
  }

  public updateFavouritesItems() {
    const address = `${apiHost}/api/favourites`;
    const body = { items: this.items.getValue() };
    const options = { withCredentials: true };

    return this.http.put<any>(address, body, options)
      .subscribe(response => {
        this.saveItemsToLocalStorage(response.items);
        this.items.next(response.items);
      });
  }

  public getFavouritesItems() {
    const address = `${apiHost}/api/favourites`;
    const options = { withCredentials: true };

    return this.http.get<any>(address, options)
      .subscribe(items => {
        this.saveItemsToLocalStorage(items.items);
        this.items.next(items.items);
      });
  }
}
