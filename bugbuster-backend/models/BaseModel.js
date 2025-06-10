export class BaseModel {
  constructor(data = {}) {
    this.id = data.id || null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  save() {
    this.updatedAt = new Date();
    console.log(`Saving model with ID: ${this.id}`);
    // Add logic to save data to a database or API
  }

  delete() {
    console.log(`Deleting model with ID: ${this.id}`);
    // Add logic to delete data from a database or API
  }
}