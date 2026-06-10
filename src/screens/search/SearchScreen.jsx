import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import BranchCard from '../../components/BranchCard';
import { useTheme } from '../../context/ThemeContext';
import { getBranches } from '../../api';

const SUGGESTIONS = ['Coffee', 'Pizza', 'Sushi', 'Family dinner', 'Terrace'];

export default function SearchScreen({ navigation }) {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  const search = useCallback(async (q) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const data = await getBranches({ search: q.trim() });
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => search(query), 400);
    return () => clearTimeout(id);
  }, [query, search]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.searchRow}>
        <View style={[styles.searchBox, { backgroundColor: theme.colors.inputBg, borderColor: theme.colors.border }]}>
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={[styles.input, { color: theme.colors.text }]}
            placeholder="Search restaurants & cafes..."
            placeholderTextColor={theme.colors.textSecondary}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {query ? (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, { backgroundColor: showFilter ? theme.colors.primary : theme.colors.inputBg }]}
          onPress={() => setShowFilter(!showFilter)}
        >
          <Ionicons
            name="options-outline"
            size={22}
            color={showFilter ? '#FFF' : theme.colors.text}
          />
        </TouchableOpacity>
      </View>

      {showFilter && (
        <View style={[styles.filterPanel, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={[styles.filterNote, { color: theme.colors.textSecondary }]}>
            More filters coming soon. Search by name, brand, or address.
          </Text>
        </View>
      )}

      {!query.trim() && (
        <View style={styles.suggestions}>
          <Text style={[styles.suggestTitle, { color: theme.colors.textSecondary }]}>Suggestions</Text>
          <View style={styles.chips}>
            {SUGGESTIONS.map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.chip, { backgroundColor: theme.colors.inputBg, borderColor: theme.colors.border }]}
                onPress={() => setQuery(s)}
              >
                <Text style={[styles.chipText, { color: theme.colors.text }]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {loading ? (
        <ActivityIndicator color={theme.colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <BranchCard
              branch={item}
              onPress={() => navigation.navigate('BranchDetail', { branchId: item.id })}
            />
          )}
          ListEmptyComponent={
            query.trim() ? (
              <Text style={[styles.empty, { color: theme.colors.textSecondary }]}>
                No results for "{query}"
              </Text>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  searchRow: { flexDirection: 'row', padding: 16, gap: 10, alignItems: 'center' },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
  },
  input: { flex: 1, fontSize: 16 },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPanel: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  filterNote: { fontSize: 13 },
  suggestions: { paddingHorizontal: 16 },
  suggestTitle: { fontSize: 13, fontWeight: '600', marginBottom: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: { fontSize: 14 },
  list: { padding: 16, paddingTop: 0 },
  loader: { marginTop: 40 },
  empty: { textAlign: 'center', marginTop: 40, fontSize: 15 },
});
