import { Injectable } from '@angular/core';

import { Client } from 'elasticsearch-browser';

@Injectable()
export class ElasticsearchService {

  private client: Client;

  constructor() {
    if (!this.client) {
      this.connect();
    }
  }

  private connect() {
    this.client = new Client({
      host: 'http://172.27.252.26:9200',
      // log: 'trace'
    });
  }

  createIndex(name): any {
    return this.client.indices.create(name);
  }

  isAvailable(): any {
    return this.client.ping({
      requestTimeout: Infinity,
      body: 'hello from switch ui!'
    });
  }
  search(data){
    return this.client.search(data)
  }
}
