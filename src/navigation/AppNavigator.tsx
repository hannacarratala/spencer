import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen    from '../screens/HomeScreen';
import ConfigScreen  from '../screens/ConfigScreen';
import GameScreen    from '../screens/GameScreen';
import ResultsScreen from '../screens/ResultsScreen';
import StatsScreen   from '../screens/StatsScreen';
import HistoryScreen from '../screens/HistoryScreen';
import { GameConfig, AnswerRecord } from '../types';
import colors from '../theme/colors';

export type RootStackParamList = {
  Home:    undefined;
  Config:  undefined;
  Game:    { config: GameConfig };
  Results: { config: GameConfig; records: AnswerRecord[]; score: number };
  Stats:   undefined;
  History: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.primary,
          headerTitleStyle: { fontWeight: '700' },
          headerBackTitle: 'Atrás',
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="Home"    component={HomeScreen}    options={{ headerShown: false }} />
        <Stack.Screen name="Config"  component={ConfigScreen}  options={{ title: 'Configurar partida' }} />
        <Stack.Screen name="Game"    component={GameScreen}    options={{ title: 'Spencer', headerShown: false }} />
        <Stack.Screen name="Results" component={ResultsScreen} options={{ title: 'Resultados', headerBackVisible: false }} />
        <Stack.Screen name="Stats"   component={StatsScreen}   options={{ title: 'Estadísticas' }} />
        <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'Historial' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
