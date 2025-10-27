import { useEffect } from 'react';

const PlayMatchStoryRedirect = () => {
  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    
    // Check for iOS/macOS
    const isApple = /iPad|iPhone|iPod|Macintosh|Mac OS X/.test(userAgent);
    
    // Redirect to appropriate store
    if (isApple) {
      window.location.href = 'https://apps.apple.com/app/match-story/id6499223049';
    } else {
      window.location.href = 'https://play.google.com/store/apps/details?id=com.big.MatchStory';
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-6 max-w-md">
        <h1 className="text-2xl font-bold mb-4">Match Story</h1>
        <p className="text-muted-foreground mb-6">
          Redirecting you to the app store...
        </p>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            If the redirect doesn't work, choose your platform:
          </p>
          <div className="flex flex-col gap-2">
            <a 
              href="https://apps.apple.com/app/match-story/id6499223049"
              className="text-primary hover:underline"
            >
              Download on App Store (iOS/macOS)
            </a>
            <a 
              href="https://play.google.com/store/apps/details?id=com.big.MatchStory"
              className="text-primary hover:underline"
            >
              Get it on Google Play (Android)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayMatchStoryRedirect;
