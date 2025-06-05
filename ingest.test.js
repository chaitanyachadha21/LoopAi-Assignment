const request = require('supertest');
const app = require('./index');

describe('Test Job Ingestion API', () => {
  let savedIngestionId;

  it('Should return ingestion_id when POST /ingest with good data', async () => {
    const response = await request(app)
      .post('/ingest')
      .send({ ids: [1, 2, 3, 4, 5], priority: 'HIGH' })
      .expect(200);

    expect(response.body.ingestion_id).toBeDefined();
    savedIngestionId = response.body.ingestion_id;
  });

  it('Should get status info when GET /status/:id with valid id', async () => {
    const response = await request(app)
      .get('/status/' + savedIngestionId)
      .expect(200);

    expect(response.body.ingestion_id).toBe(savedIngestionId);
    expect(['yet_to_start', 'triggered', 'completed']).toContain(response.body.status);
    expect(Array.isArray(response.body.batches)).toBe(true);
  });

  it('Should return 400 error when POST /ingest with wrong priority', async () => {
    await request(app)
      .post('/ingest')
      .send({ ids: [1, 2], priority: 'WRONG' })
      .expect(400);
  });

  it('Should return 400 error when POST /ingest with wrong ids data', async () => {
    await request(app)
      .post('/ingest')
      .send({ ids: 'not-an-array', priority: 'LOW' })
      .expect(400);
  });

  it('Should return 404 error when GET /status/:id with invalid id', async () => {
    await request(app)
      .get('/status/invalid-id')
      .expect(404);
  });
});
