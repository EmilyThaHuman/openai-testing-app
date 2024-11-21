import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  cardVariants,
  containerVariants,
  listItemVariants,
} from '@/config/animations';
import { useAuth } from '@/context/AuthContext';
import { AccountPageLayout } from '@/layout/AccountPageLayout';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Camera,
  Globe,
  Mail,
  MapPin,
  Phone,
  Shield,
  User,
} from 'lucide-react';
import { useState } from 'react';

// Inspired by Aceternity UI's card hover effects
const HoverCard = ({ className, children, ...props }) => {
  return (
    <motion.div
      className={cn(
        'group relative rounded-xl border border-border/50 hover:border-primary/50 transition-all duration-500',
        'bg-background/95 backdrop-blur-sm shadow-sm hover:shadow-lg',
        className
      )}
      whileHover={{ scale: 1.005 }}
      {...props}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};

// Inspired by Magic UI's input field
const InputWithIcon = ({ icon: Icon, ...props }) => {
  return (
    <div className="relative group">
      <Icon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
      <Input
        {...props}
        className={cn(
          'pl-9 transition-all duration-300',
          'border-border/50 focus:border-primary/50',
          'hover:border-primary/30 focus:ring-2 focus:ring-primary/20',
          'bg-background/50 backdrop-blur-sm'
        )}
      />
    </div>
  );
};

export function AccountProfilePage() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({
    displayName: user?.user_metadata?.full_name || '',
    bio: user?.user_metadata?.bio || '',
    location: user?.user_metadata?.location || '',
    website: user?.user_metadata?.website || '',
    company: user?.user_metadata?.company || '',
    githubUsername: user?.user_metadata?.github_username || '',
  });

  return (
    <AccountPageLayout title="Profile Settings">
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="space-y-8"
      >
        {/* Profile Header */}
        <HoverCard className="p-8">
          <motion.div
            variants={cardVariants}
            className="flex items-center gap-8"
          >
            <div className="relative group">
              <Avatar className="h-32 w-32 ring-4 ring-primary/10 transition-all duration-300 group-hover:ring-primary/30">
                <AvatarImage src={user?.avatar_url} className="object-cover" />
                <AvatarFallback className="text-3xl bg-primary/5">
                  {user?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="secondary"
                size="icon"
                className="absolute -bottom-2 -right-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                {user?.name}
              </h2>
              <p className="text-muted-foreground text-lg">{user?.email}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="h-4 w-4" />
                <span>{user?.location || 'Location not set'}</span>
              </div>
            </div>
          </motion.div>
        </HoverCard>

        {/* Profile Form */}
        <motion.div variants={cardVariants}>
          <HoverCard className="p-8">
            <form className="space-y-8">
              {/* Personal Information */}
              <div className="space-y-6">
                <motion.div
                  variants={listItemVariants}
                  className="flex items-center gap-2"
                >
                  <User className="h-5 w-5 text-primary" />
                  <h3 className="text-xl font-semibold">
                    Personal Information
                  </h3>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div variants={listItemVariants} className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <InputWithIcon
                      icon={User}
                      id="name"
                      defaultValue={user?.name}
                    />
                  </motion.div>

                  <motion.div variants={listItemVariants} className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <InputWithIcon
                      icon={Mail}
                      id="email"
                      defaultValue={user?.email}
                    />
                  </motion.div>

                  <motion.div variants={listItemVariants} className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <InputWithIcon
                      icon={Phone}
                      id="phone"
                      defaultValue={user?.phone}
                    />
                  </motion.div>

                  <motion.div variants={listItemVariants} className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <InputWithIcon
                      icon={MapPin}
                      id="location"
                      defaultValue={user?.location}
                    />
                  </motion.div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-6">
                <motion.div
                  variants={listItemVariants}
                  className="flex items-center gap-2"
                >
                  <Briefcase className="h-5 w-5 text-primary" />
                  <h3 className="text-xl font-semibold">
                    Professional Details
                  </h3>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div variants={listItemVariants} className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <InputWithIcon
                      icon={Briefcase}
                      id="company"
                      defaultValue={user?.company}
                    />
                  </motion.div>

                  <motion.div variants={listItemVariants} className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <InputWithIcon
                      icon={Shield}
                      id="role"
                      defaultValue={user?.role}
                    />
                  </motion.div>
                </div>
              </div>

              <motion.div
                variants={listItemVariants}
                className="flex justify-end gap-4 pt-4"
              >
                <Button
                  variant="outline"
                  className="transition-all duration-300 hover:bg-secondary"
                >
                  Cancel
                </Button>
                <Button className="relative overflow-hidden transition-all duration-300 hover:scale-105">
                  <span className="relative z-10">Save Changes</span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary/50 to-primary opacity-0 hover:opacity-100 transition-opacity duration-300"
                    whileHover={{ scale: 1.1 }}
                  />
                </Button>
              </motion.div>
            </form>
          </HoverCard>
        </motion.div>
      </motion.div>
    </AccountPageLayout>
  );
}

export default AccountProfilePage;
