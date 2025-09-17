// components/common/ErrorBoundary.tsx
import React from "react";
import { View, Text, Button } from "react-native";
import { logBreadcrumb } from "@/utils/globalErrorHandler";

type Props = React.PropsWithChildren<{ onReset?: () => void }>;

type State = { hasError: boolean; error?: Error };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // eslint-disable-next-line no-console
    console.error("[REACT-ERROR]", error?.message, error?.stack, errorInfo);
    logBreadcrumb("ReactErrorBoundary", { message: error?.message });
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
          <Text style={{ color: "red", fontSize: 16, marginBottom: 12, textAlign: "center" }}>
            Ocorreu um erro inesperado.
          </Text>
          <Button title="Tentar novamente" onPress={this.reset} />
        </View>
      );
    }
    return this.props.children;
  }
}
