import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Moon, Bell, CalendarDays, Cloud, Lock, Server, ChevronRight } from 'lucide-react-native';
import { SettingsContext } from '../context/SettingsContext';
import { useTheme } from '../../../shared/utils/theme';

export default function SettingsScreen({ navigation }) {
    const { C, T, R, S } = useTheme();
    const s = getStyles(C, T, R, S);
    const { settings, updateSetting } = useContext(SettingsContext);

    const SwitchRow = ({ icon: Icon, label, desc, value, onValue }) => (
        <View style={s.row}>
            <View style={s.rowIcon}>
                <Icon size={16} color={C.textSub} strokeWidth={1.5} />
            </View>
            <View style={s.rowContent}>
                <Text style={s.rowLabel}>{label}</Text>
                {desc && <Text style={s.rowDesc}>{desc}</Text>}
            </View>
            <Switch
                trackColor={{ false: C.surface3, true: C.white }}
                thumbColor={value ? C.black : C.textMuted}
                onValueChange={onValue}
                value={value}
            />
        </View>
    );

    const LinkRow = ({ icon: Icon, label, desc, onPress, right }) => (
        <TouchableOpacity style={s.row} onPress={onPress}>
            <View style={s.rowIcon}>
                <Icon size={16} color={C.textSub} strokeWidth={1.5} />
            </View>
            <View style={s.rowContent}>
                <Text style={s.rowLabel}>{label}</Text>
                {desc && <Text style={s.rowDesc}>{desc}</Text>}
            </View>
            {right
                ? <View style={s.valuePill}><Text style={s.valueText}>{right}</Text></View>
                : <ChevronRight size={16} color={C.textMuted} strokeWidth={1.5} />}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={s.root}>
            <View style={s.header}>
                <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
                    <ChevronLeft size={20} color={C.text} strokeWidth={1.5} />
                </TouchableOpacity>
                <View>
                    <Text style={s.headerLabel}>PREFERENCES</Text>
                    <Text style={s.headerTitle}>Settings</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

                <Text style={s.groupLabel}>APPEARANCE</Text>
                <View style={s.group}>
                    <LinkRow
                        icon={Moon}
                        label="Dark Mode"
                        desc={settings.theme === 'auto' ? "Adapts to device defaults" : "Manually configured"}
                        right={settings.theme === 'auto' ? "Auto" : settings.theme === 'dark' ? "Dark" : "Light"}
                        onPress={() => {
                            let nextTheme = 'auto';
                            if (settings.theme === 'auto') nextTheme = 'dark';
                            else if (settings.theme === 'dark') nextTheme = 'light';
                            updateSetting('theme', nextTheme);
                        }}
                    />
                </View>

                <Text style={s.groupLabel}>NOTIFICATIONS</Text>
                <View style={s.group}>
                    <SwitchRow
                        icon={Bell}
                        label="Enable Notifications"
                        desc="Get reminders and alerts"
                        value={settings.notificationsEnabled}
                        onValue={(v) => updateSetting('notificationsEnabled', v)}
                    />
                </View>

                <Text style={s.groupLabel}>CALENDAR</Text>
                <View style={s.group}>
                    <LinkRow
                        icon={CalendarDays}
                        label="Week Start Day"
                        desc="Choose where your week begins"
                        right={settings.weekStartDay}
                        onPress={() => updateSetting('weekStartDay', settings.weekStartDay === 'Monday' ? 'Sunday' : 'Monday')}
                    />
                </View>

                <Text style={s.groupLabel}>SECURITY & DATA</Text>
                <View style={s.group}>
                    <SwitchRow
                        icon={Cloud}
                        label="Cloud Backup"
                        desc="Auto-sync your data"
                        value={settings.cloudBackup}
                        onValue={(v) => updateSetting('cloudBackup', v)}
                    />
                    <View style={s.separator} />
                    <SwitchRow
                        icon={Lock}
                        label="App Lock"
                        desc="Require biometrics to open"
                        value={settings.appLock}
                        onValue={(v) => updateSetting('appLock', v)}
                    />
                    <View style={s.separator} />
                    <LinkRow
                        icon={Server}
                        label="Data & Backup"
                        desc="Export or restore your data"
                        onPress={() => navigation.navigate('Backup')}
                    />
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const getStyles = (C, T, R, S) => StyleSheet.create({
    root: { flex: 1, backgroundColor: C.black },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: S.md,
        paddingHorizontal: S.xl,
        paddingTop: S.lg,
        paddingBottom: S.xl,
    },
    backBtn: {
        width: 36, height: 36, borderRadius: R.md,
        backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
        justifyContent: 'center', alignItems: 'center',
    },
    headerLabel: { ...T.cap, marginBottom: 2 },
    headerTitle: { ...T.h3 },
    scroll: { paddingHorizontal: S.xl },
    groupLabel: { ...T.cap, marginBottom: S.sm, marginTop: S.md },
    group: {
        backgroundColor: C.surface,
        borderRadius: R.xl,
        borderWidth: 1,
        borderColor: C.border,
        overflow: 'hidden',
        marginBottom: S.sm,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: S.lg,
        paddingVertical: S.md,
        gap: S.md,
        minHeight: 58,
    },
    rowIcon: {
        width: 34, height: 34, borderRadius: R.sm,
        backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border,
        justifyContent: 'center', alignItems: 'center',
    },
    rowContent: { flex: 1 },
    rowLabel: { ...T.h5, fontSize: 14 },
    rowDesc: { ...T.label, fontSize: 11, marginTop: 2 },
    valuePill: {
        paddingHorizontal: S.md, paddingVertical: S.xs,
        borderRadius: R.round,
        borderWidth: 1,
        borderColor: C.borderMed,
        backgroundColor: C.surface2,
    },
    valueText: { ...T.label, color: C.text, fontSize: 12 },
    separator: { height: 1, backgroundColor: C.border, marginHorizontal: S.lg },
});
