const getOperationMetadata = ({
  operator = 'toModel',
  model = null,
  promptVersion = null,
  vendor = null,
  name = null,
  id = null,
  uuid = null,
  runId = null,
  tags = [],
}) => ({
  // general metadata
  uuid: uuid || crypto.randomUUID(),
  timestamp: timestamp || (new Date()).toISOString(),
  operator: 'toModel',
  // optional metadata
  name,
  runId,
  id,
  tags,
  // for toModel calls
  vendor,
  model,
  // for toPrompt calls
  promptVersion,
});

export default getOperationMetadata;