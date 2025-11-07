import React from "react";
import { View, Text } from "react-native";
import { Card, CardTitle, CardValue, CardStatus, IconButton } from "./style";
import { MaterialIcons } from "@expo/vector-icons";

interface SyncCardProps {
  title: string;
  icon: React.ReactNode;
  currentValue: number;
  totalValue: number;
  status: string;
  lastSync: string;
  progress: number;
  isLoading: boolean;
  onSync: () => void;
  disabled?: boolean;
}

export const SyncCard: React.FC<SyncCardProps> = ({
  title,
  icon,
  currentValue,
  totalValue,
  status,
  lastSync,
  progress,
  isLoading,
  onSync,
  disabled,
}) => {
  return (
    <Card>
      {icon}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginVertical: 5,
        }}
      >
        <CardTitle>{title}</CardTitle>
        <CardValue>
          {currentValue}/{totalValue}
        </CardValue>
      </View>
      <CardStatus>
        {status} - {lastSync}
      </CardStatus>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginVertical: 5,
        }}
      >
        <View
          style={{
            flex: 1,
            height: 10,
            backgroundColor: "#ccc",
            marginRight: 10,
            borderRadius: 5,
          }}
        >
          <View
            style={{
              width: `${progress}%`,
              height: "100%",
              backgroundColor: isLoading ? "orange" : "green", // Define a cor baseada no status

              borderRadius: 5,
            }}
          />
        </View>
        <Text>{progress.toFixed(2)}%</Text>
      </View>

      <IconButton onPress={disabled ? undefined : onSync} disabled={disabled}>
        {isLoading ? (
          <MaterialIcons name="hourglass-empty" size={28} color="black" />
        ) : (
          <MaterialIcons name="sync" size={28} color="black" />
        )}
      </IconButton>
    </Card>
  );
};
