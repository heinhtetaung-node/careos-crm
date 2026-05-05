import Document from './document';
/**
 * @param {any}  body - A string param.
 */
export default class DocumentRepository {
  uploadDocument = (body: any) => Document.uploadDocument(body);
}
