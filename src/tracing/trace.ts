import crypto from 'crypto';

import type {
  TextModelConfig,
  TextModelInfo,
  TextResponseResult,
  TokenUsage
} from '../ai/types.js';

import type {
  AITextChatRequest,
  AITextCompletionRequest,
  AITextEmbedRequest,
  AITextRequestIdentity,
  AITextTraceStep,
  AITextTraceStepRequest,
  AITextTraceStepResponse,
  APIError,
  ParsingError,
  TextModelInfoWithProvider
} from './types.js';

export class ModelInfoBuilder {
  private info: TextModelInfoWithProvider = {} as TextModelInfoWithProvider;

  setName(name: string): this {
    this.info.name = name;
    return this;
  }

  setCurrency(currency: string): this {
    this.info.currency = currency;
    return this;
  }

  setCharacterIsToken(characterIsToken: boolean): this {
    this.info.characterIsToken = characterIsToken;
    return this;
  }

  setPromptTokenCostPer1M(promptTokenCostPer1M: number): this {
    this.info.promptTokenCostPer1M = promptTokenCostPer1M;
    return this;
  }

  setCompletionTokenCostPer1M(completionTokenCostPer1M: number): this {
    this.info.completionTokenCostPer1M = completionTokenCostPer1M;
    return this;
  }

  setProvider(provider: string): this {
    this.info.provider = provider;
    return this;
  }

  build(): TextModelInfo & { provider: string } {
    return this.info;
  }
}

export class ModelConfigBuilder {
  private config: TextModelConfig = {} as TextModelConfig;

  setMaxTokens(maxTokens: number): this {
    this.config.maxTokens = maxTokens;
    return this;
  }

  setTemperature(temperature: number): this {
    this.config.temperature = temperature;
    return this;
  }

  setTopP(topP: number): this {
    this.config.topP = topP;
    return this;
  }

  setTopK(topK: number): this {
    this.config.topK = topK;
    return this;
  }

  setN(n: number): this {
    this.config.n = n;
    return this;
  }

  setStream(stream: boolean): this {
    this.config.stream = stream;
    return this;
  }

  setLogprobs(logprobs: number): this {
    this.config.logprobs = logprobs;
    return this;
  }

  setEcho(echo: boolean): this {
    this.config.echo = echo;
    return this;
  }

  setPresencePenalty(presencePenalty: number): this {
    this.config.presencePenalty = presencePenalty;
    return this;
  }

  setFrequencyPenalty(frequencyPenalty: number): this {
    this.config.frequencyPenalty = frequencyPenalty;
    return this;
  }

  setBestOf(bestOf: number): this {
    this.config.bestOf = bestOf;
    return this;
  }

  setLogitBias(logitBias: ReadonlyMap<string, number>): this {
    this.config.logitBias = logitBias as Map<string, number>;
    return this;
  }

  setSuffix(suffix: string | null): this {
    this.config.suffix = suffix;
    return this;
  }

  build(): TextModelConfig {
    return this.config;
  }
}

export class TextResponseBuilder {
  private response: AITextTraceStepResponse = {} as AITextTraceStepResponse;

  setResults(results?: readonly TextResponseResult[]): this {
    if (results) {
      this.response.results = results;
    }
    return this;
  }

  setModelUsage(modelUsage?: Readonly<TokenUsage>): this {
    this.response.modelUsage = modelUsage;
    return this;
  }

  setEmbedModelUsage(embedModelUsage?: Readonly<TokenUsage>): this {
    this.response.embedModelUsage = embedModelUsage;
    return this;
  }

  setRemoteId(remoteId?: string): this {
    this.response.remoteId = remoteId;
    return this;
  }

  setModelResponseTime(modelResponseTime?: number): this {
    this.response.modelResponseTime = modelResponseTime;
    return this;
  }

  setEmbedModelResponseTime(embedModelResponseTime?: number): this {
    this.response.embedModelResponseTime = embedModelResponseTime;
    return this;
  }

  setParsingError(parsingError?: Readonly<ParsingError>): this {
    this.response.parsingError = parsingError;
    return this;
  }

  setApiError(apiError?: Readonly<APIError>): this {
    this.response.apiError = apiError;
    return this;
  }

  // Include other setter methods for all fields...

  build(): AITextTraceStepResponse {
    return this.response;
  }
}

/*
let response = new TextResponseBuilder()
    .addResults([{text: 'Text', id: '1', finishReason: 'Stop'}])
    .addFunction({name: 'function1', args: '1', result: 'result1'})
    .setModelResponseTime(123)
    .setEmbedModelResponseTime(456)
    .setParsingError({message: 'error', value: 'value'})
    .setApiError({
      message: 'api error', 
      status: 400, 
      header: {'header1': 'value1'}, 
      request: {'request1': 'value1'}, 
      body: {'body1': 'value1'}
    })
    .build();
*/

export class TextRequestBuilder {
  private request: AITextTraceStepRequest = {} as AITextTraceStepRequest;

  setSystemPrompt(systemPrompt?: string): this {
    (this.request as AITextCompletionRequest).systemPrompt = systemPrompt;
    return this;
  }

  setCompletionStep(
    req: Readonly<AITextCompletionRequest>,
    modelConfig?: Readonly<TextModelConfig>,
    modelInfo?: Readonly<TextModelInfoWithProvider>
  ) {
    const request: AITextCompletionRequest | AITextChatRequest = { ...req };
    if (!req.modelConfig) {
      request.modelConfig = modelConfig;
    }
    if (!req.modelInfo) {
      request.modelInfo = modelInfo;
    }
    this.request = request;
    return this;
  }

  setChatStep(
    req: Readonly<AITextChatRequest>,
    modelConfig?: Readonly<TextModelConfig>,
    modelInfo?: Readonly<TextModelInfoWithProvider>
  ) {
    const request: AITextCompletionRequest = { ...req };
    if (!req.modelConfig) {
      request.modelConfig = modelConfig;
    }
    if (!req.modelInfo) {
      request.modelInfo = modelInfo;
    }
    this.request = request;

    return this;
  }

  addChat(chat: Readonly<AITextChatRequest['chatPrompt'][0]>): this {
    const req = this.request as AITextChatRequest;
    if (!req.chatPrompt) {
      req.chatPrompt = [];
    }
    req.chatPrompt.push(chat);
    return this;
  }

  setFunctionCall(functionCall: Readonly<AITextChatRequest['functionCall']>) {
    (this.request as AITextCompletionRequest | AITextChatRequest).functionCall =
      functionCall;
    return this;
  }

  setEmbedStep(
    req: Readonly<AITextEmbedRequest>,
    modelInfo?: Readonly<TextModelInfoWithProvider>
  ) {
    const request: AITextEmbedRequest = { ...req };
    if (!req.embedModelInfo) {
      request.embedModelInfo = modelInfo;
    }
    this.request = request;
    return this;
  }

  setIdentity(identity?: Readonly<AITextRequestIdentity>): this {
    this.request.identity = identity;
    return this;
  }

  build(): Readonly<AITextTraceStepRequest> {
    return this.request;
  }
}

export class AITextTraceStepBuilder {
  private traceStep: AITextTraceStep = {
    createdAt: new Date().toISOString()
  } as AITextTraceStep;

  setTraceId(traceId?: string): this {
    this.traceStep.traceId = traceId ?? crypto.randomUUID();
    return this;
  }

  setSessionId(sessionId?: string): this {
    this.traceStep.sessionId = sessionId;
    return this;
  }

  setRequest(request: Readonly<TextRequestBuilder>): this {
    this.traceStep.request = request.build();
    return this;
  }

  setResponse(response: Readonly<TextResponseBuilder>): this {
    this.traceStep.response = response.build();
    return this;
  }

  setModelResponseTime(modelResponseTime?: number): this {
    if (!this.traceStep.response) {
      this.traceStep.response = {} as AITextTraceStepResponse;
    }
    this.traceStep.response.modelResponseTime = modelResponseTime;
    return this;
  }

  setApiError(apiError?: Readonly<APIError>): this {
    if (!this.traceStep.response) {
      this.traceStep.response = {} as AITextTraceStepResponse;
    }
    this.traceStep.response.apiError = apiError;
    return this;
  }

  build(): AITextTraceStep {
    return this.traceStep;
  }

  isStream(): boolean {
    return (
      (this.traceStep.request as AITextCompletionRequest | AITextChatRequest)
        .modelConfig?.stream ?? false
    );
  }
}

export const sendTrace = async (
  endpoint: string,
  headers: Readonly<Record<string, string>>,
  step: Readonly<AITextTraceStep>
) => {
  if (!endpoint || endpoint === '') {
    throw new Error('Trace endpoint is required');
  }

  const { traceId, sessionId } = step;
  const apiUrl = new URL(`/api/t/traces`, endpoint);

  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: JSON.stringify({ traceId, sessionId, step })
  });

  const respText = await res.text();
  let respVal: string;

  try {
    const json = JSON.parse(respText);
    respVal = JSON.stringify(json, null, 2);

    if (json.error) {
      throw new Error(`Sending trace to ${apiUrl}:\n${respVal}`);
    }
  } catch (e) {
    throw new Error(`Sending trace to ${apiUrl}:\n${respText}`);
  }

  console.log(`Sent trace to ${apiUrl}:\n${respVal}`);
};

export const getMemory = async (
  endpoint: string,
  headers: Readonly<Record<string, string>>,
  filter: Readonly<{ sessionId?: string; user?: string; limit?: number }>
): Promise<{ role?: string; text: string }[]> => {
  const apiUrl = new URL(`/api/t/traces/memory`, endpoint);

  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: JSON.stringify({ ...filter, limit: filter.limit ?? 10 })
  });

  const json = await res.json();
  return json.memory ?? [];
};
