import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

import { CardProduct } from '../../models';
import { NotificationService } from '../notification/notification.service';
import { LocalizationService } from '../localization/localization.service';
import { localStorageCartKey } from '../../constants';
import { apiHost } from 'src/environments/environment';
import { debounceTime, switchMap, share } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  public readonly items$: Observable<CardProduct[]>;

  private readonly items = new BehaviorSubject<CardProduct[]>([]);

  constructor(
    private readonly localizationService: LocalizationService,
    private readonly notificationService: NotificationService,
    private readonly http: HttpClient,
  ) {
    this.items$ = this.items;
    this.init();
  }

  private init() {
    const itemsFromLocalStorage = this.getItemsFromLocalStorage();

    if (itemsFromLocalStorage) {
      this.items.next(itemsFromLocalStorage);
    }
  }

  public addToCart(cardProduct: CardProduct) {
    const updatedItems = this.items.value;

    const idx = this.findIndexSameCardProduct(cardProduct);
    if (idx !== -1) {
      updatedItems[idx].quantity += cardProduct.quantity;
    } else {
      updatedItems.push(cardProduct);
    }

    this.saveItemsToLocalStorage(updatedItems);

    this.items.next(updatedItems);

    const message = this.localizationService.getNotificationServiceMessage('addToCart');
    this.notificationService.info(`${cardProduct.title} ${message}`);
  }

  private findIndexSameCardProduct(cardProduct: CardProduct) {
    for (let i = 0; i < this.items.value.length; i++) {
      const item = this.items.value[i];
      if (item.id === cardProduct.id && item.color === cardProduct.color && item.size) {
        return i;
      }
    }

    return -1;
  }

  public deleteFromCart(cardProduct: CardProduct) {
    const updatedItems = [
      ...this.items.value.filter(el => el.id !== cardProduct.id)
    ];

    this.saveItemsToLocalStorage(updatedItems);

    this.items.next(updatedItems);

    const message = this.localizationService.getNotificationServiceMessage('deleteFromCart');
    this.notificationService.warning(`${cardProduct.title} ${message}`);
  }

  public clearCart() {
    const updatedItems = [];

    this.saveItemsToLocalStorage(updatedItems);

    this.items.next(updatedItems);

    const message = this.localizationService.getNotificationServiceMessage('clearCart');
    this.notificationService.warning(message);
  }

  private getItemsFromLocalStorage(): CardProduct[] | null {
    const localStorageData = localStorage.getItem(localStorageCartKey);

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
    localStorage.setItem(localStorageCartKey, JSON.stringify(items));
  }

  public readonly increaseQuantity = (index: number) => {
    const products = this.items.value;
    products[index].quantity++;
    this.items.next(products);
    this.saveItemsToLocalStorage(products);
    this.updateWithDebounce();
  }

  public readonly decreaseQuantity = (index: number) => {
    const products = this.items.value;
    if (products[index].quantity > 1) {
      products[index].quantity--;
      this.items.next(products);
      this.saveItemsToLocalStorage(products);
      this.updateWithDebounce();
    }
  }

  public sendNewCartItems() {
    const address = `${apiHost}/api/cart`;
    const body = { newItems: this.items.getValue() };
    const options = { withCredentials: true };

    return this.http.patch<any>(address, body, options)
      .subscribe(items => {
        this.saveItemsToLocalStorage(items);
        this.items.next(items);
      });
  }

  public updateWithDebounce() {
    const address = `${apiHost}/api/cart`;
    const body = { items: this.items.getValue() };
    const options = { withCredentials: true };

    const debounce = 1000;

    return this.http.put<any>(address, body, options)
      .pipe(
        debounceTime(debounce),
        switchMap(() =>
          this.http.put<any>(address, { items: this.items.getValue() }, options)
        ),
        share()
      )
      .subscribe(response => {
        return response;
      });
  }

  public updateCartItems() {
    const address = `${apiHost}/api/cart`;
    const body = { items: this.items.getValue() };
    const options = { withCredentials: true };

    return this.http.put<any>(address, body, options)
      .subscribe(response => {
        return response;
      });
  }

  public getCartItems() {
    const address = `${apiHost}/api/cart`;
    const options = { withCredentials: true };

    return this.http.get<any>(address, options)
      .subscribe(items => {
        this.saveItemsToLocalStorage(items.items);
        this.items.next(items.items);
      });
  }
}
