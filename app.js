const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());
const PORT = 5000;

const PRIORITY_MAP = {
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

let jobQueue = [];
let ingestionStatusMap = {};
let batchMap = {};
let batchIdCounter = 1;

function simulateFetch(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id, data: 'processed' });
    }, 1000);
  });
}


setInterval(() => {
  if (jobQueue.length === 0) return;

  jobQueue.sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    return a.createdAt - b.createdAt;
  });

  const batchJobs = jobQueue.splice(0, 3);

  batchJobs.forEach((job) => {
    if (batchMap[job.batchId].status === 'yet_to_start') {
      batchMap[job.batchId].status = 'triggered';
    }

    simulateFetch(job.id).then(() => {
      const batch = batchMap[job.batchId];
      batch.completed.push(job.id);

      if (batch.completed.length === batch.ids.length) {
        batch.status = 'completed';
      }

      const ingestion = ingestionStatusMap[job.ingestionId];
      let allStatuses = ingestion.batches.map(b => batchMap[b.batch_id].status);

      if (allStatuses.every(s => s === 'completed')) {
        ingestion.status = 'completed';
      } else if (allStatuses.some(s => s === 'triggered')) {
        ingestion.status = 'triggered';
      } else {
        ingestion.status = 'yet_to_start';
      }
    });
  });
}, 5000);

app.post('/ingest', (req, res) => {
  const { ids, priority = 'LOW' } = req.body;

  if (!Array.isArray(ids) || !PRIORITY_MAP[priority]) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  const ingestionId = uuidv4();
  const createdAt = Date.now();
  const batches = [];

  for (let i = 0; i < ids.length; i += 3) {
    const batchIds = ids.slice(i, i + 3);
    const batchId = batchIdCounter++;

    batchMap[batchId] = {
      batch_id: batchId,
      ids: batchIds,
      completed: [],
      status: 'yet_to_start'
    };

    batches.push({ batch_id: batchId, ids: batchIds });

    batchIds.forEach(id => {
      jobQueue.push({
        id,
        priority: PRIORITY_MAP[priority],
        createdAt,
        ingestionId,
        batchId
      });
    });
  }

  ingestionStatusMap[ingestionId] = {
    ingestion_id: ingestionId,
    status: 'yet_to_start',
    batches
  };

  res.json({ ingestion_id: ingestionId });
});

app.get('/status/:id', (req, res) => {
  const ingestion = ingestionStatusMap[req.params.id];

  if (!ingestion) {
    return res.status(404).json({ error: 'Ingestion ID not found' });
  }

  const batches = ingestion.batches.map(b => ({
    batch_id: b.batch_id,
    ids: b.ids,
    status: batchMap[b.batch_id]?.status || 'yet_to_start'
  }));

  res.json({
    ingestion_id: ingestion.ingestion_id,
    status: ingestion.status,
    batches
  });
});

const jobInterval = setInterval(() => {
  if (jobQueue.length === 0) return;

  jobQueue.sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    return a.createdAt - b.createdAt;
  });

  const batchJobs = jobQueue.splice(0, 3);

  batchJobs.forEach((job) => {
    if (batchMap[job.batchId].status === 'yet_to_start') {
      batchMap[job.batchId].status = 'triggered';
    }

    simulateFetch(job.id).then(() => {
      const batch = batchMap[job.batchId];
      batch.completed.push(job.id);

      if (batch.completed.length === batch.ids.length) {
        batch.status = 'completed';
      }

      const ingestion = ingestionStatusMap[job.ingestionId];
      let allStatuses = ingestion.batches.map(b => batchMap[b.batch_id].status);

      if (allStatuses.every(s => s === 'completed')) {
        ingestion.status = 'completed';
      } else if (allStatuses.some(s => s === 'triggered')) {
        ingestion.status = 'triggered';
      } else {
        ingestion.status = 'yet_to_start';
      }
    });
  });
}, 5000);

module.exports = { app, jobInterval };

if (require.main === module) {
  const PORT = 5000;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

