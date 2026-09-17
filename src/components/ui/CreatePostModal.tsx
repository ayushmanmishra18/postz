import React from 'react';
import { View, Text, Pressable, TextInput, Image, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { tw } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import { useCreatePost, useUploadImages } from '@/hooks/usePosts';
import { useUIStore } from '@/store/uiStore';
import { Button } from './Button';
import { Avatar } from './Avatar';
import { useAuthStore } from '@/store/authStore';
import * as ImagePicker from 'expo-image-picker';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialContent?: string;
  initialImages?: string[];
}

export function CreatePostModal({ isOpen, onClose, initialContent = '', initialImages = [] }: CreatePostModalProps) {
  const { user } = useAuthStore();
  const { closeCreatePost } = useUIStore();
  const createPost = useCreatePost();
  const uploadImages = useUploadImages();

  const [content, setContent] = React.useState(initialContent);
  const [images, setImages] = React.useState<string[]>(initialImages);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [charCount, setCharCount] = React.useState(content.length);
  const MAX_CHARS = 2000;

  React.useEffect(() => {
    setContent(initialContent);
    setImages(initialImages);
    setCharCount(initialContent.length);
  }, [isOpen, initialContent, initialImages]);

  const handleSubmit = async () => {
    if (!content.trim() && images.length === 0) return;
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      let finalImages = images;
      
      if (images.some(img => img.startsWith('file://') || img.startsWith('content://'))) {
        const uploadResult = await uploadImages.mutateAsync(images);
        finalImages = uploadResult;
      }

      await createPost.mutateAsync({
        content: content.trim(),
        images: finalImages,
        visibility: 'public',
      });

      onClose();
      closeCreatePost();
    } catch (error) {
      // Error handled in mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  const pickImages = async () => {
    if (images.length >= 4) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 4 - images.length,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages(prev => [...prev, ...result.assets.map(a => a.uri)]);
    }
  };

  const takePhoto = async () => {
    if (images.length >= 4) return;

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages(prev => [...prev, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className={tw`fixed inset-0 z-50 bg-black/50 flex flex-col`}
      style={StyleSheet.absoluteFillObject}
    >
      <View className={tw`flex-1 bg-white dark:bg-surface-900 flex-col`}>
        <View className={tw`flex-row items-center justify-between p-4 border-b border-surface-200 dark:border-surface-700`}>
          <Pressable onPress={onClose} className={tw`p-2 rounded-full active:bg-surface-100 dark:active:bg-surface-800`}>
            <Ionicons name="close" size={24} color="#71717a" />
          </Pressable>
          <Text className={tw`text-lg font-semibold text-surface-900 dark:text-surface-50`}>New Thought</Text>
          <Button
            onPress={handleSubmit}
            disabled={(!content.trim() && images.length === 0) || isSubmitting}
            className={tw`ml-auto`}
            size="sm"
            variant="primary"
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </Button>
        </View>

        <View className={tw`flex-1 p-4 flex-row gap-3`}>
          <Avatar source={user?.avatar} name={user?.displayName} size="md" />
          <View className={tw`flex-1 flex-col`}>
            <TextInput
              multiline
              placeholder="What's on your mind?"
              value={content}
              onChangeText={(text) => {
                setContent(text);
                setCharCount(text.length);
              }}
              className={tw`flex-1 text-lg text-surface-900 dark:text-surface-50 placeholder:text-surface-400 min-h-[120px]`}
              maxLength={MAX_CHARS}
              autoFocus
            />
            <View className={tw`mt-3 flex-row items-center justify-between`}>
              <View className={tw`flex-row gap-2`}>
                <Pressable onPress={pickImages} className={tw`p-2 rounded-full active:bg-surface-100 dark:active:bg-surface-800`}>
                  <Ionicons name="image-outline" size={24} color="#71717a" />
                </Pressable>
                <Pressable onPress={takePhoto} className={tw`p-2 rounded-full active:bg-surface-100 dark:active:bg-surface-800`}>
                  <Ionicons name="camera-outline" size={24} color="#71717a" />
                </Pressable>
              </View>
              <Text className={tw`text-sm text-surface-500 dark:text-surface-400`}>
                {charCount}/{MAX_CHARS}
              </Text>
            </View>
          </View>
        </View>

        {images.length > 0 && (
          <View className={tw`px-4 pb-4`}>
            <View className={tw`flex-row gap-2 overflow-x-auto pb-2`}>
              {images.map((image, index) => (
                <View key={index} className={tw`relative w-24 h-24 flex-shrink-0`}>
                  <Image
                    source={{ uri: image }}
                    className={tw`w-full h-full rounded-lg bg-cover`}
                  />
                  <Pressable
                    onPress={() => removeImage(index)}
                    className={tw`absolute top-1 right-1 p-1 rounded-full bg-black/50`}
                  >
                    <Ionicons name="close" size={16} color="white" />
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}