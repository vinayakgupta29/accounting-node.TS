// src/docs/swagger.ts
import YAML from 'yamljs';
import path from 'path';

const swaggerDocument = YAML.load(path.resolve(__dirname, './swagger.yaml'));

export default swaggerDocument;

