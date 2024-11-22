import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Link as LinkIcon, Edit, Upload } from 'lucide-react';
import { GitHub } from '@mui/icons-material';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 },
  },
};

export function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: user?.user_metadata?.full_name || '',
    bio: user?.user_metadata?.bio || '',
    location: user?.user_metadata?.location || '',
    website: user?.user_metadata?.website || '',
    company: user?.user_metadata?.company || '',
    githubUsername: user?.user_metadata?.github_username || '',
  });

  const handleSave = async () => {
    try {
      await updateProfile({
        ...user.user_metadata,
        ...profileData,
      });

      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });

      setIsEditing(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error updating profile',
        description: error.message,
      });
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container max-w-4xl py-8"
    >
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-32 h-32">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback>
                  {user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button variant="outline" size="sm" className="gap-2">
                  <Upload className="w-4 h-4" />
                  Change Avatar
                </Button>
              )}
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">
                    {isEditing ? (
                      <Input
                        value={profileData.displayName}
                        onChange={e =>
                          setProfileData(prev => ({
                            ...prev,
                            displayName: e.target.value,
                          }))
                        }
                        className="text-2xl font-bold"
                      />
                    ) : (
                      profileData.displayName || user?.email
                    )}
                  </h1>
                  <p className="text-muted-foreground">{user?.email}</p>
                </div>
                <Button
                  variant={isEditing ? 'default' : 'outline'}
                  onClick={() =>
                    isEditing ? handleSave() : setIsEditing(true)
                  }
                  className="gap-2"
                >
                  {isEditing ? (
                    <>Save Changes</>
                  ) : (
                    <>
                      <Edit className="w-4 h-4" />
                      Edit Profile
                    </>
                  )}
                </Button>
              </div>

              {isEditing ? (
                <Textarea
                  value={profileData.bio}
                  onChange={e =>
                    setProfileData(prev => ({
                      ...prev,
                      bio: e.target.value,
                    }))
                  }
                  placeholder="Write a short bio..."
                  className="min-h-[100px]"
                />
              ) : (
                profileData.bio && (
                  <p className="text-muted-foreground">{profileData.bio}</p>
                )
              )}

              <div className="flex flex-wrap gap-4">
                {profileData.location && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {profileData.location}
                  </div>
                )}
                {profileData.website && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <LinkIcon className="w-4 h-4" />
                    <a
                      href={profileData.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary"
                    >
                      {profileData.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
                {profileData.githubUsername && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <GitHub className="w-4 h-4" />
                    <a
                      href={`https://github.com/${profileData.githubUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary"
                    >
                      {profileData.githubUsername}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Activity</CardTitle>
            <CardDescription>
              Your recent activity and contributions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Add activity feed here */}
              <p className="text-muted-foreground text-center py-8">
                No recent activity
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Usage</CardTitle>
            <CardDescription>Your API usage statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Add API usage stats here */}
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Requests</span>
                <Badge variant="secondary">0</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Tokens</span>
                <Badge variant="secondary">0</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

export default ProfilePage;
