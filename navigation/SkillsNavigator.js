import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SkillListScreen from '../screens/SkillListScreen';
import SkillDetailScreen from '../screens/SkillDetailScreen';

const Stack = createNativeStackNavigator();

export default function SkillsNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="SkillList" component={SkillListScreen} />
            <Stack.Screen name="SkillDetail" component={SkillDetailScreen} />
        </Stack.Navigator>
    );
}
