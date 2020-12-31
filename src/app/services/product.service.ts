import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { PouchDB } from 'pouchdb/dist/pouchdb';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { Product } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  data:any;
  db:any;
  remote:any;
  base_path: 'http://localhost:3000/products'

  constructor(private http:HttpClient) { 
    this.db = new PouchDB('prods');
    this.remote = 'http://localhost:5984/prods';

    let options = {
      live: true,
      retry: true,
      continuous: true,
      auto_compaction: true
    };

    this.db.sync(this.remote, options);
  }

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  }

  handleError(error: HttpErrorResponse){
    if(error.error instanceof ErrorEvent){
      console.error('An error occurred:', error.error.message);
    }
    else{
      console.error(
        `Backend returned code ${error.status}, `+
        `body was: ${error.error}`);
    }

    return throwError(
      `Something bad happened; please try again later.`);
  };

  createProduct(product): Observable<Product>{
    return this.http
          .post<Product>(this.base_path, JSON.stringify(product), this.httpOptions)
          .pipe(
            retry(2),
            catchError(this.handleError)
          )
  }

  getProduct(_id):Observable<Product>{
    return this.http
            .get<Product>(this.base_path + '/' + _id)
            .pipe(
              retry(2),
              catchError(this.handleError)
            )
  }

  getListOfProducts():Observable<Product>{
    return this.http
            .get<Product>(this.base_path)
            .pipe(
              retry(2),
              catchError(this.handleError)
            )
  }

  updateProduct(_id, product): Observable<Product>{
    return this.http
            .put<Product>(this.base_path + '/' + _id, JSON.stringify(product), this.httpOptions)
            .pipe(
              retry(2),
              catchError(this.handleError)
            )
  }

  deleteProduct(_id){
    return this.http
            .delete<Product>(this.base_path + '/' + _id, this.httpOptions)
            .pipe(
              retry(2),
              catchError(this.handleError)
            )
  }

  saveActivity(data){
    data.activityDateTime = moment().format();
    data.activity = 'Dashboard';
    data._id = (moment().unix()).toString();
    this.db.put(data).then((resp) => {
      console.log(resp);
      return resp;
    })
    .catch((e) => {
      console.log(e);
      return e;
    });
  }


}
