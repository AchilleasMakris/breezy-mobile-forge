import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  useWindowDimensions,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

import ActivityChart from '../../components/ActivityChart';

const onboardingSlides = [
  {
    id: '1',
    title: 'Welcome to UniTracker!',
    subtitle: 'Your all-in-one academic companion for university success',
  },
  {
    id: '2',
    title: 'Stay Organized',
    subtitle: 'Track assignments, manage deadlines, and never miss important tasks',
  },
  {
    id: '3',
    title: 'Monitor Progress',
    subtitle: 'Visualize your academic journey with detailed analytics and insights',
  },
];

const OnboardingArt = ({ index }: { index: number }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  
  // Individual card animations
  const card1Anim = useRef(new Animated.Value(0)).current;
  const card2Anim = useRef(new Animated.Value(0)).current;
  const card1Scale = useRef(new Animated.Value(0.9)).current;
  const card2Scale = useRef(new Animated.Value(0.9)).current;
  
  // Floating animation
  const floatAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Reset animations
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    scaleAnim.setValue(0.8);
    card1Anim.setValue(0);
    card2Anim.setValue(0);
    card1Scale.setValue(0.9);
    card2Scale.setValue(0.9);

    // Main container animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();

    // Staggered card animations
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(card1Anim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(card1Scale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }, 200);

    setTimeout(() => {
      Animated.parallel([
        Animated.spring(card2Anim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(card2Scale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }, 400);

    // Continuous floating animation
    const startFloating = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    setTimeout(startFloating, 800);
  }, [index]);

  if (index === 0) {
    // Welcome Screen - Dashboard Preview
    const floatY = floatAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -8],
    });

    return (
      <Animated.View 
        style={[
          styles.artContainer,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        <View style={styles.cardStack}>
          <Animated.View 
            style={[
              styles.modernCard, 
              styles.welcomeCard,
              {
                opacity: card1Anim,
                transform: [
                  { scale: card1Scale },
                  { translateY: floatY },
                  { 
                    translateX: card1Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-30, 0],
                    })
                  },
                ],
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <Animated.View 
                style={[
                  styles.iconWrapper,
                  {
                    transform: [{
                      rotate: card1Anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      })
                    }]
                  }
                ]}
              >
                <Feather name="home" size={24} color="#6366f1" />
              </Animated.View>
              <Text style={styles.cardTitle}>Dashboard</Text>
            </View>
            <Text style={styles.cardSubtitle}>Your academic overview at a glance</Text>
            
            <View style={styles.statsRow}>
              {[
                { number: '8.7', label: 'GPA' },
                { number: '12', label: 'Courses' },
                { number: '85%', label: 'Progress' }
              ].map((stat, i) => (
                <Animated.View 
                  key={i}
                  style={[
                    styles.statItem,
                    {
                      opacity: card1Anim,
                      transform: [{
                        translateY: card1Anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0],
                        })
                      }]
                    }
                  ]}
                >
                  <Text style={styles.statNumber}>{stat.number}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          <Animated.View 
            style={[
              styles.modernCard, 
              styles.taskPreviewCard,
              {
                opacity: card2Anim,
                transform: [
                  { scale: card2Scale },
                  { 
                    translateY: floatAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 6],
                    })
                  },
                  { 
                    translateX: card2Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    })
                  },
                ],
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <Animated.View 
                style={[
                  styles.iconWrapper,
                  {
                    transform: [{
                      scale: card2Anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 1],
                      })
                    }]
                  }
                ]}
              >
                <Feather name="check-square" size={20} color="#10b981" />
              </Animated.View>
              <Text style={styles.cardTitle}>Recent Activity</Text>
            </View>
            
            <View style={styles.activityItem}>
              <Animated.View 
                style={[
                  styles.activityDot, 
                  { 
                    backgroundColor: '#10b981',
                    transform: [{
                      scale: card2Anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                      })
                    }]
                  }
                ]} 
              />
              <Text style={styles.activityText}>Completed Math Assignment</Text>
            </View>
            <View style={styles.activityItem}>
              <Animated.View 
                style={[
                  styles.activityDot, 
                  { 
                    backgroundColor: '#f59e0b',
                    transform: [{
                      scale: card2Anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                      })
                    }]
                  }
                ]} 
              />
              <Text style={styles.activityText}>Physics Lab Due Tomorrow</Text>
            </View>
          </Animated.View>
        </View>
      </Animated.View>
    );
  }

  if (index === 1) {
    // Organization Screen - Task Management
    const pulseAnim = floatAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.05],
    });

    return (
      <Animated.View 
        style={[
          styles.artContainer,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        <View style={styles.cardStack}>
          <Animated.View 
            style={[
              styles.modernCard, 
              styles.taskCard,
              {
                opacity: card1Anim,
                transform: [
                  { scale: card1Scale },
                  { 
                    translateY: floatAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -6],
                    })
                  },
                  { 
                    rotateZ: card1Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['-2deg', '0deg'],
                    })
                  },
                ],
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <Animated.View 
                style={[
                  styles.iconWrapper,
                  {
                    transform: [{
                      scale: card1Anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1],
                      })
                    }]
                  }
                ]}
              >
                <Feather name="list" size={20} color="#6366f1" />
              </Animated.View>
              <Text style={styles.cardTitle}>Today's Tasks</Text>
              <Animated.View 
                style={[
                  styles.badge,
                  {
                    transform: [
                      { scale: pulseAnim },
                      {
                        rotate: card1Anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg'],
                        })
                      }
                    ]
                  }
                ]}
              >
                <Text style={styles.badgeText}>3</Text>
              </Animated.View>
            </View>
            
            <View style={styles.taskList}>
              {[
                {
                  icon: 'alert-circle',
                  iconColor: '#ef4444',
                  bgColor: '#fee2e2',
                  title: 'CS Assignment',
                  due: 'Due: Today 11:59 PM',
                  priority: 'High',
                  priorityColor: '#ef4444'
                },
                {
                  icon: 'clock',
                  iconColor: '#f59e0b',
                  bgColor: '#fef3c7',
                  title: 'Read Chapter 5',
                  due: 'Due: Tomorrow',
                  priority: 'Med',
                  priorityColor: '#f59e0b'
                }
              ].map((task, i) => (
                <Animated.View 
                  key={i}
                  style={[
                    styles.taskItem,
                    {
                      opacity: card1Anim,
                      transform: [{
                        translateX: card1Anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [i % 2 === 0 ? -50 : 50, 0],
                        })
                      }]
                    }
                  ]}
                >
                  <Animated.View 
                    style={[
                      styles.taskIcon, 
                      { 
                        backgroundColor: task.bgColor,
                        transform: [{
                          rotate: card1Anim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '360deg'],
                          })
                        }]
                      }
                    ]}
                  >
                    <Feather name={task.icon as any} size={16} color={task.iconColor} />
                  </Animated.View>
                  <View style={styles.taskContent}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <Text style={styles.taskDue}>{task.due}</Text>
                  </View>
                  <Animated.View 
                    style={[
                      styles.priorityTag, 
                      { 
                        backgroundColor: task.bgColor,
                        transform: [{
                          scale: card1Anim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.8, 1],
                          })
                        }]
                      }
                    ]}
                  >
                    <Text style={[styles.priorityText, { color: task.priorityColor }]}>{task.priority}</Text>
                  </Animated.View>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          <Animated.View 
            style={[
              styles.modernCard, 
              styles.calendarCard,
              {
                opacity: card2Anim,
                transform: [
                  { scale: card2Scale },
                  { 
                    translateY: floatAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 8],
                    })
                  },
                  { 
                    rotateZ: card2Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['2deg', '0deg'],
                    })
                  },
                ],
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <Animated.View 
                style={[
                  styles.iconWrapper,
                  {
                    transform: [{
                      rotateY: card2Anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['180deg', '0deg'],
                      })
                    }]
                  }
                ]}
              >
                <Feather name="calendar" size={20} color="#8b5cf6" />
              </Animated.View>
              <Text style={styles.cardTitle}>This Week</Text>
            </View>
            
            <View style={styles.weekView}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, i) => (
                <Animated.View 
                  key={day} 
                  style={[
                    styles.dayColumn,
                    {
                      opacity: card2Anim,
                      transform: [{
                        translateY: card2Anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [30, 0],
                        })
                      }]
                    }
                  ]}
                >
                  <Text style={styles.dayLabel}>{day}</Text>
                  <Animated.View 
                    style={[
                      styles.dayIndicator,
                      { 
                        backgroundColor: i === 2 ? '#6366f1' : '#e2e8f0',
                        transform: [{
                          scale: i === 2 ? pulseAnim : 1,
                        }]
                      }
                    ]} 
                  />
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        </View>
      </Animated.View>
    );
  }

  if (index === 2) {
    // Progress Screen - Analytics
    const chartGrowthAnim = card1Anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    return (
      <Animated.View 
        style={[
          styles.artContainer,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        <View style={styles.cardStack}>
          <Animated.View 
            style={[
              styles.modernCard, 
              styles.analyticsCard,
              {
                opacity: card1Anim,
                transform: [
                  { scale: card1Scale },
                  { 
                    translateY: floatAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -5],
                    })
                  },
                  { 
                    rotateZ: card1Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['-1deg', '0deg'],
                    })
                  },
                ],
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <Animated.View 
                style={[
                  styles.iconWrapper,
                  {
                    transform: [{
                      scale: floatAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.1],
                      })
                    }]
                  }
                ]}
              >
                <Feather name="trending-up" size={20} color="#10b981" />
              </Animated.View>
              <Text style={styles.cardTitle}>Performance Analytics</Text>
            </View>
            
            <View style={styles.chartContainer}>
              <View style={styles.miniChart}>
                {[40, 65, 45, 80, 60, 90, 75].map((height, i) => (
                  <Animated.View
                    key={i}
                    style={[
                      styles.chartBar,
                      {
                        height: height * 0.6,
                        backgroundColor: i === 5 ? '#10b981' : '#e2e8f0',
                        transform: [{
                          scaleY: chartGrowthAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.1, 1],
                          })
                        }]
                      },
                    ]}
                  />
                ))}
              </View>
              <Animated.Text 
                style={[
                  styles.chartLabel,
                  {
                    opacity: card1Anim,
                    transform: [{
                      translateY: card1Anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      })
                    }]
                  }
                ]}
              >
                Weekly Task Completion
              </Animated.Text>
            </View>
          </Animated.View>

          <Animated.View 
            style={[
              styles.modernCard, 
              styles.achievementCard,
              {
                opacity: card2Anim,
                transform: [
                  { scale: card2Scale },
                  { 
                    translateY: floatAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 7],
                    })
                  },
                  { 
                    rotateZ: card2Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['1deg', '0deg'],
                    })
                  },
                ],
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <Animated.View 
                style={[
                  styles.iconWrapper,
                  {
                    transform: [{
                      rotateY: card2Anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['180deg', '0deg'],
                      })
                    }]
                  }
                ]}
              >
                <Feather name="book" size={20} color="#f59e0b" />
              </Animated.View>
              <Text style={styles.cardTitle}>Your Classes</Text>
            </View>
            
            <View style={styles.achievementList}>
              {[
                {
                  icon: 'video',
                  iconColor: '#3b82f6',
                  bgColor: '#dbeafe',
                  text: 'Online Classes: 8'
                },
                {
                  icon: 'map-pin',
                  iconColor: '#8b5cf6',
                  bgColor: '#f3e8ff',
                  text: 'In-Person Classes: 4'
                }
              ].map((achievement, i) => (
                <Animated.View 
                  key={i}
                  style={[
                    styles.achievementItem,
                    {
                      opacity: card2Anim,
                      transform: [{
                        translateX: card2Anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [i % 2 === 0 ? -40 : 40, 0],
                        })
                      }]
                    }
                  ]}
                >
                  <Animated.View 
                    style={[
                      styles.achievementIcon, 
                      { 
                        backgroundColor: achievement.bgColor,
                        transform: [
                          {
                            scale: card2Anim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.5, 1],
                            })
                          },
                          {
                            rotate: card2Anim.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0deg', '360deg'],
                            })
                          }
                        ]
                      }
                    ]}
                  >
                    <Feather name={achievement.icon as any} size={16} color={achievement.iconColor} />
                  </Animated.View>
                  <Animated.Text 
                    style={[
                      styles.achievementText,
                      {
                        opacity: card2Anim,
                        transform: [{
                          translateY: card2Anim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [10, 0],
                          })
                        }]
                      }
                    ]}
                  >
                    {achievement.text}
                  </Animated.Text>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        </View>
      </Animated.View>
    );
  }

  return null;
};

const OnboardingItem = ({
  item,
  index,
}: {
  item: (typeof onboardingSlides)[0];
  index: number;
}) => {
  const { width } = useWindowDimensions();
  return (
    <View style={[styles.slideContainer, { width }]}>
      <OnboardingArt index={index} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>
    </View>
  );
};

export default function Onboarding() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList<(typeof onboardingSlides)[0]> | null>(null);
  const router = useRouter();
  const { width } = useWindowDimensions();

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = (index: number) => {
    if (slidesRef.current) {
      slidesRef.current.scrollToIndex({ index, animated: true });
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('@viewedOnboarding', 'true');
      router.replace('/(auth)');
    } catch (e) {
      console.error('Failed to save onboarding status', e);
    }
  };

  const Paginator = ({ data }: { data: any[] }) => (
    <View style={styles.paginatorContainer}>
      {data.map((_, i) => {
        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [8, 24, 8],
          extrapolate: 'clamp',
        });
        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        });
        return (
          <Animated.View 
            style={[
              styles.dot, 
              { 
                width: dotWidth, 
                opacity,
                backgroundColor: i === currentIndex ? '#6366f1' : '#cbd5e1',
              }
            ]} 
            key={i.toString()} 
          />
        );
      })}
    </View>
  );

  return (
    <LinearGradient colors={['#f8fafc', '#e2e8f0', '#cbd5e1']} style={styles.container}>
      <SafeAreaView style={styles.container}>
        <FlatList
          data={onboardingSlides}
          renderItem={({ item, index }) => <OnboardingItem item={item} index={index} />}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
            useNativeDriver: false,
          })}
          scrollEventThrottle={32}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          ref={slidesRef}
        />

        <View style={styles.controlsContainer}>
          <Paginator data={onboardingSlides} />
          {currentIndex < onboardingSlides.length - 1 ? (
            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.button, styles.skipButton]} onPress={completeOnboarding}>
                <Text style={[styles.buttonText, styles.skipButtonText]}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.nextButton]}
                onPress={() => scrollTo(currentIndex + 1)}
              >
                <Text style={[styles.buttonText, styles.nextButtonText]}>Next</Text>
                <Feather name="arrow-right" size={20} color="#ffffff" style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.button, styles.getStartedButton]} onPress={completeOnboarding}>
                <Text style={[styles.buttonText, styles.getStartedButtonText]}>Get Started</Text>
                <Feather name="arrow-right" size={20} color="#ffffff" style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slideContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  artContainer: {
    flex: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  cardStack: {
    width: '100%',
    gap: 20,
  },
  modernCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  welcomeCard: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  taskCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
  },
  taskPreviewCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  calendarCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#8b5cf6',
  },
  analyticsCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  achievementCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1e293b',
    flex: 1,
  },
  cardSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  badge: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: '#ffffff',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#1e293b',
  },
  statLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  activityText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#475569',
  },
  taskList: {
    gap: 12,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  taskIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#1e293b',
  },
  taskDue: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  priorityTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 10,
  },
  weekView: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  dayColumn: {
    alignItems: 'center',
    gap: 8,
  },
  dayLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#64748b',
  },
  dayIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chartContainer: {
    alignItems: 'center',
  },
  miniChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 60,
    marginBottom: 12,
  },
  chartBar: {
    width: 8,
    borderRadius: 4,
    minHeight: 8,
  },
  chartLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#64748b',
  },
  achievementList: {
    gap: 12,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  achievementIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#475569',
  },
  textContainer: {
    flex: 0.4,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    marginBottom: 16,
    color: '#1e293b',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 18,
    textAlign: 'center',
    color: '#475569',
    lineHeight: 26,
  },
  controlsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  paginatorContainer: {
    flexDirection: 'row',
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    flex: 1,
  },
  skipButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  nextButton: {
    backgroundColor: '#6366f1',
  },
  getStartedButton: {
    backgroundColor: '#6366f1',
  },
  buttonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  skipButtonText: {
    color: '#6366f1',
  },
  nextButtonText: {
    color: '#ffffff',
  },
  getStartedButtonText: {
    color: '#ffffff',
  },
  buttonContainer: {
    gap: 16,
  },
}); 