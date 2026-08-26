import { context, trace } from '@opentelemetry/api';
import pino from 'pino';
import pretty from 'pino-pretty';

const stream = pretty({
  colorize: true,
  messageFormat: '{msg} [trace_id={trace_id}, span_id={span_id}]',
  translateTime: 'yyyy-mm-dd HH:MM:ss.l o',
});

// Binds the active OpenTelemetry span (set up in src/opentelemetry.ts, which
// auto-instruments outbound fetch/http calls) into every log line, so a
// warning about a failed outbound request can be correlated with the same
// request in the downstream service's own traces/logs.
export const logger = pino(
  {
    mixin() {
      const spanContext = trace.getSpanContext(context.active());
      if (!spanContext) return {};
      return { trace_id: spanContext.traceId, span_id: spanContext.spanId };
    },
  },
  stream,
);

export const logError = (error: unknown, context: Record<string, unknown>, message: string) => {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  const errorStack = error instanceof Error ? error.stack : 'No stack trace available';

  logger.error(
    {
      error: {
        message: errorMessage,
        stack: errorStack,
      },
      ...context,
    },
    message,
  );
};
