import { DialogDefault, DialogLogin } from "@/widgets/dialogs";
import { FeaturedImageGallery, MasonryGridGallery, DefaultGallery, CarouselDefault, ImgWithBlurredCaption, VideoMuted } from "@/widgets/images";
import { MegaMenuWithHover, StepperWithContent } from "@/widgets/meniu";
import { RatingColors, RatingWithText } from "@/widgets/ratings";
import DefaultRating from "@/widgets/ratings/rating-default";
import { SpeedDialWithTextInside, SpeedDialWithTextOutside } from "@/widgets/speeddials";
import { TabsWithIcon, UnderlineTabs, VerticalTabsWithIcon } from "@/widgets/tabs";
import { ActivitiesTimeline, TimelineWithAvatar } from "@/widgets/timelines";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
} from "@material-tailwind/react";


export function Components() {
  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Mega meniu with hover
          </Typography>
        </CardHeader>
        <CardBody className="p-4">
          <MegaMenuWithHover />
        </CardBody>
      </Card>
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Dialogs
          </Typography>
        </CardHeader>
        <CardBody className="p-4">
          <DialogDefault/>
          <DialogLogin/>
        </CardBody>
      </Card>
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Ratings
          </Typography>
        </CardHeader>
        <CardBody className="p-4">
          <div className="gird-cols-1 mb-12 grid gap-12 px-4 lg:grid-cols-2 xl:grid-cols-3">
            <div>
              <DefaultRating />
            </div>
            <div>
              <RatingWithText />
            </div>
            <div>
              <RatingColors />
            </div>
          </div>

        </CardBody>
      </Card>
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Speed dials
          </Typography>
        </CardHeader>
        <CardBody className="p-4">
          <div className="gird-cols-1 mb-12 grid gap-12 px-4 lg:grid-cols-2 xl:grid-cols-3">
            <div>
              <SpeedDialWithTextInside />
            </div>
            <div>
              <SpeedDialWithTextOutside />
            </div>
          </div>

        </CardBody>
      </Card>
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Steppers and tabs
          </Typography>
        </CardHeader>
        <CardBody className="p-4">
          <div className="mb-12">
            <StepperWithContent />
          </div>
          <div className="mb-12">
            <TabsWithIcon />
          </div>
          <div className="mb-12">
            <VerticalTabsWithIcon />
          </div>
          <div className="mb-12">
            <UnderlineTabs />
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Timelines
          </Typography>
        </CardHeader>
        <CardBody className="p-4">
          <div className="gird-cols-1 mb-12 grid gap-12 px-4 lg:grid-cols-2">
            <div className="mb-12">
              <ActivitiesTimeline />
            </div>
            <div className="mb-12">
              <TimelineWithAvatar />
            </div>
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Carousels
          </Typography>
        </CardHeader>
        <CardBody className="py-4 px-20">
          <CarouselDefault />
        </CardBody>
      </Card>
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Default gallery
          </Typography>
        </CardHeader>
        <CardBody className="p-4">
          <DefaultGallery />
        </CardBody>
      </Card>
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Featured image gallery
          </Typography>
        </CardHeader>
        <CardBody className="p-4">
          <FeaturedImageGallery />
        </CardBody>
      </Card>
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Masonry grid gallery
          </Typography>
        </CardHeader>
        <CardBody className="p-4">
          <MasonryGridGallery />
        </CardBody>
      </Card>
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Image with blured caption
          </Typography>
        </CardHeader>
        <CardBody className="p-4">
          <ImgWithBlurredCaption />
        </CardBody>
      </Card>
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Video muted
          </Typography>
        </CardHeader>
        <CardBody className="p-4">
          <VideoMuted />
        </CardBody>
      </Card>
    </div>
  );
}

export default Components;
