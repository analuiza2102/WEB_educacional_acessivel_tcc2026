function isHttpUrl(value) {
  return typeof value === 'string' && /^https?:\/\//i.test(value);
}

function validateProva(prova) {
  const errors = [];

  if (!prova?.titulo) errors.push('titulo is required');
  if (!prova?.ano) errors.push('ano is required');
  if (!prova?.url_arquivo && !prova?.url_gabarito) errors.push('url_arquivo or url_gabarito is required');
  if (prova?.url_arquivo && !isHttpUrl(prova.url_arquivo)) errors.push('url_arquivo must start with http');
  if (prova?.url_gabarito && !isHttpUrl(prova.url_gabarito)) errors.push('url_gabarito must start with http');
  if (prova?.tipo !== 'ENEM') errors.push('tipo must be ENEM');
  if (prova?.instituicao !== 'INEP') errors.push('instituicao must be INEP');
  if (prova?.status !== 'pending_review') errors.push('status must be pending_review');

  return {
    valid: errors.length === 0,
    errors
  };
}

export { validateProva };
