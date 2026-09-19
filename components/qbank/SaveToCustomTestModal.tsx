import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/theme';
import { supabase, CustomTest } from '@/lib/supabase';
import { useAlert } from '@/contexts/AlertContext';

interface SaveToCustomTestModalProps {
  visible: boolean;
  questionId: string;
  onClose: () => void;
}

export const SaveToCustomTestModal: React.FC<SaveToCustomTestModalProps> = ({
  visible,
  questionId,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const { showAlert } = useAlert();
  
  const [loading, setLoading] = useState(true);
  const [customTests, setCustomTests] = useState<CustomTest[]>([]);
  
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchCustomTests();
      setIsCreatingNew(false);
      setNewTitle('');
    }
  }, [visible]);

  const fetchCustomTests = async () => {
    try {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      
      const { data, error } = await supabase
        .from('custom_tests')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setCustomTests(data || []);
    } catch (err) {
      console.error('Error fetching custom tests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = async () => {
    if (!newTitle.trim()) {
      showAlert({ title: 'Error', message: 'Title is required' });
      return;
    }
    
    try {
      setSaving(true);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      // 1. Create the test
      const { data: newTest, error: createError } = await supabase
        .from('custom_tests')
        .insert({
          user_id: userData.user.id,
          title: newTitle.trim()
        })
        .select()
        .single();
        
      if (createError) throw createError;

      // 2. Add question to it
      await handleAddToTest(newTest.id);
    } catch (err: any) {
      console.error('Error creating test:', err);
      showAlert({ title: 'Error', message: err.message });
      setSaving(false);
    }
  };

  const handleAddToTest = async (testId: string) => {
    try {
      setSaving(true);
      
      // Check if already exists
      const { data: existing } = await supabase
        .from('custom_test_questions')
        .select('id')
        .eq('custom_test_id', testId)
        .eq('question_id', questionId)
        .single();
        
      if (existing) {
        showAlert({ title: 'Info', message: 'Question already in this test' });
        onClose();
        return;
      }
      
      // Insert
      const { error } = await supabase
        .from('custom_test_questions')
        .insert({
          custom_test_id: testId,
          question_id: questionId
        });
        
      if (error) throw error;
      
      showAlert({ title: 'Success', message: 'Question added to custom test', type: 'success' });
      onClose();
    } catch (err: any) {
      console.error('Error adding to test:', err);
      showAlert({ title: 'Error', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.modalBox, { paddingBottom: Math.max(insets.bottom + 16, 16) }]}>
          <View style={styles.header}>
            <Text style={styles.title}>Save to Custom Test</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={24} color={Colors.onSurfaceVariant} />
            </Pressable>
          </View>
          
          <ScrollView style={styles.content}>
            {loading ? (
              <ActivityIndicator size="large" color={Colors.primary} style={{ marginVertical: 32 }} />
            ) : (
              <>
                <Pressable 
                  style={styles.createBtn}
                  onPress={() => setIsCreatingNew(!isCreatingNew)}
                >
                  <MaterialIcons name="add" size={20} color={Colors.primary} />
                  <Text style={styles.createBtnText}>Create New Custom Test</Text>
                </Pressable>
                
                {isCreatingNew && (
                  <View style={styles.newTestBox}>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Weak Anatomy Topics"
                      value={newTitle}
                      onChangeText={setNewTitle}
                      autoFocus
                    />
                    <Pressable 
                      style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                      onPress={handleCreateNew}
                      disabled={saving}
                    >
                      {saving ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.saveBtnText}>Create & Save</Text>
                      )}
                    </Pressable>
                  </View>
                )}
                
                {customTests.length > 0 && <Text style={styles.sectionTitle}>Or add to existing:</Text>}
                
                {customTests.map(test => (
                  <Pressable 
                    key={test.id} 
                    style={styles.testItem}
                    onPress={() => handleAddToTest(test.id)}
                    disabled={saving}
                  >
                    <MaterialIcons name="folder" size={24} color={Colors.primary} />
                    <Text style={styles.testItemText}>{test.title}</Text>
                    {saving && <ActivityIndicator size="small" color={Colors.primary} />}
                  </Pressable>
                ))}
                
                {customTests.length === 0 && !isCreatingNew && (
                  <Text style={styles.emptyText}>You haven't created any custom tests yet.</Text>
                )}
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    paddingHorizontal: 20,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  createBtnText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  newTestBox: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    marginTop: 8,
    marginBottom: 12,
  },
  testItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant,
  },
  testItemText: {
    flex: 1,
    fontSize: 16,
    color: Colors.onSurface,
  },
  emptyText: {
    color: Colors.onSurfaceVariant,
    marginTop: 16,
    fontStyle: 'italic',
  }
});
