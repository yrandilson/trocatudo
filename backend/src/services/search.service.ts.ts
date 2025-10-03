// backend/src/services/search.service.ts
import { Client } from '@elastic/elasticsearch';

export class SearchService {
  private client: Client;

  constructor() {
    this.client = new Client({
      node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200'
    });
  }

  async indexItem(item: Item) {
    await this.client.index({
      index: 'items',
      id: item.id.toString(),
      body: {
        titulo: item.titulo,
        descricao: item.descricao,
        categoria: item.categoria,
        status: item.status,
        userId: item.userId,
        createdAt: item.createdAt
      }
    });
  }

  async searchItems(query: string, filters?: any) {
    const { body } = await this.client.search({
      index: 'items',
      body: {
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query,
                  fields: ['titulo^2', 'descricao'],
                  fuzziness: 'AUTO'
                }
              }
            ],
            filter: filters
          }
        }
      }
    });

    return body.hits.hits;
  }
}