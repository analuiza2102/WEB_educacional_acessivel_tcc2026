import { supabaseAdmin } from './supabaseAdmin.js';

const CHUNK_SIZE = 25;

async function runWithRetry(operation, attempts = 3) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === attempts) {
        throw lastError;
      }

      await new Promise(resolve => setTimeout(resolve, attempt * 400));
    }
  }

  throw lastError;
}

function chunkArray(items, size) {
  const chunks = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

async function fetchExistingStatuses(tableName, slugs) {
  const uniqueSlugs = [...new Set(slugs.filter(Boolean))];

  if (uniqueSlugs.length === 0) {
    return new Map();
  }

  const existingRows = [];
  const chunks = chunkArray(uniqueSlugs, CHUNK_SIZE);

  for (const chunk of chunks) {
    const { data, error } = await runWithRetry(() =>
      supabaseAdmin
        .from(tableName)
        .select('slug, status')
        .in('slug', chunk)
    );

    if (error) {
      throw new Error(`Erro ao consultar status existentes em ${tableName}: ${error.message}`);
    }

    existingRows.push(...(data ?? []));
  }

  return new Map(existingRows.map(row => [row.slug, row.status]));
}

async function preserveExistingStatus(tableName, rows) {
  const existingStatuses = await fetchExistingStatuses(
    tableName,
    rows.map(row => row.slug)
  );

  let preservedCount = 0;
  let newCount = 0;

  const mergedRows = rows.map(row => {
    const existingStatus = existingStatuses.get(row.slug);

    if (existingStatus) {
      preservedCount += 1;
      return {
        ...row,
        status: existingStatus
      };
    }

    newCount += 1;
    return row;
  });

  return {
    rows: mergedRows,
    preservedCount,
    newCount
  };
}

export { fetchExistingStatuses, preserveExistingStatus };
