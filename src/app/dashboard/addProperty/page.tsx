// @ts-nocheck
'use client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React, { useState, useEffect } from 'react';
import { useForm, Controller, SubmitHandler, useFieldArray } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CircleX, Loader2, Plus, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import LocationN from '@/components/locationN';
import { GrClosedCaption } from 'react-icons/gr';
import { uploadToS3, uploadVideoToS3 } from '@/components/uploadImageS3';
import { aiDescription, createProperty, getAllCategories, getFirstUser, updateProperty } from '@/actions/actions';
import { useSelector } from 'react-redux';
import { useSearchParams, useRouter } from 'next/navigation';

interface IFormInput {
  title: string;
  userId: string | null;
  categoryId: string;
  price: null | number;
  description: string;
  bedrooms: null | number;
  bathrooms: null | number;
  kitchen: null | number;
  propertyNumber: null | number;
  water: string;
  electricity: string;
  hasStorage: boolean;
  address: string;
  lat: null | number;
  lng: null | number;
  gate: boolean;
  gateman: boolean;
  images: File[];
  video: File | null;
  hospital: Array<{
    name: string;
    distance: string;
    type: string;
  }>;
  school: Array<{
    name: string;
    distance: string;
    type: string;
  }>
  market: Array<{
    name: string;
    distance: string;
    type: string;
  }>,
  color: string;
  mainCarrefour: string;
  distanceFromRoad: number;
}

export default function Page() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSecondSection, setShowSecondSection] = useState(false);
  const [showAdditionalFields, setShowAdditionalFields] = useState(false);
  const [categories, setCategories] = useState([]);
  const [user, setUser] = useState(null);
  const [clickedLocation, setClickedLocation] = useState<{ latitude: number | null, longitude: number | null }>({
    latitude: null,
    longitude: null,
  });
  const [cityAddress, setCityAddress] = useState({ longitude: 11.502612977652129, latitude: 3.847739697100343 })
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState<'hospital' | 'school' | 'market'>('hospital');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { control, register, handleSubmit, watch, reset, setValue, formState: { errors, isValid }, } = useForm<IFormInput>({
    mode: 'onChange',
    defaultValues: {
      title: '',
      categoryId: '',
      userId: '',
      price: null,
      description: '',
      bedrooms: null,
      bathrooms: null,
      kitchen: null,
      propertyNumber: null,
      water: '',
      electricity: '',
      hasStorage: false,
      address: '',
      lat: null,
      lng: null,
      gate: false,
      gateman: false,
      images: [],
      video: null,
      hospital: [],
      school: [],
      market: [],
      color: '',
      mainCarrefour: '',
      distanceFromRoad: 0,
    },
  });

  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Controls the dialog open state

  const users = useSelector((state: any) => state.property.user);
  useEffect(() => {
    const fetchCategoriesAndSection = async () => {
      setCategories(await getAllCategories());
      setUser(users);
      setValue("userId", users?.id);
      
      // Check if we're in edit mode
      const editId = searchParams.get('edit');
      if (editId && users?.properties) {
        const propertyToEdit = users.properties.find((p: any) => p.id === editId);
        if (propertyToEdit) {
          setIsEditMode(true);
          setEditingPropertyId(editId);
          setShowSecondSection(true);
          
          // Populate form with existing data
          setValue('title', propertyToEdit.title);
          setValue('categoryId', propertyToEdit.categoryId);
          setValue('price', propertyToEdit.price);
          setValue('description', propertyToEdit.description);
          setValue('bedrooms', propertyToEdit.bedrooms);
          setValue('bathrooms', propertyToEdit.bathrooms);
          setValue('kitchen', propertyToEdit.kitchen);
          setValue('propertyNumber', propertyToEdit.propertyNumber);
          setValue('water', propertyToEdit.water);
          setValue('electricity', propertyToEdit.electricity);
          setValue('hasStorage', propertyToEdit.hasStorage);
          setValue('address', propertyToEdit.address);
          setValue('lat', propertyToEdit.lat);
          setValue('lng', propertyToEdit.lng);
          setValue('gate', propertyToEdit.gate);
          setValue('gateman', propertyToEdit.gateman);
          setValue('hospital', propertyToEdit.hospital || []);
          setValue('school', propertyToEdit.school || []);
          setValue('market', propertyToEdit.market || []);
          
          if (propertyToEdit.lat && propertyToEdit.lng) {
            setClickedLocation({ latitude: propertyToEdit.lat, longitude: propertyToEdit.lng });
            setCityAddress({ latitude: propertyToEdit.lat, longitude: propertyToEdit.lng });
          }
          
          if (propertyToEdit.images && propertyToEdit.images.length > 0) {
            setSelectedImages(propertyToEdit.images);
          }
        }
      }
    };
    fetchCategoriesAndSection();
  }, [users, searchParams, setValue]);

  useEffect(() => {
    if (clickedLocation.latitude !== null && clickedLocation.longitude !== null) {
      setValue('lat', clickedLocation.latitude);
      setValue('lng', clickedLocation.longitude);
      setCityAddress({ latitude: clickedLocation.latitude, longitude: clickedLocation.longitude });
    }
  }, [clickedLocation, setValue]);

  const hospitalFields = useFieldArray({
    control,
    name: 'hospital',
  });

  const schoolFields = useFieldArray({
    control,
    name: 'school',
  });

  const restaurantFields = useFieldArray({
    control,
    name: 'market',
  });

  const onSubmitt = async (data: IFormInput) => {
    const { title, color, mainCarrefour, distanceFromRoad } = data;
  
    if (!color || !mainCarrefour || !distanceFromRoad) {
      toast.error('Please fill in all required fields.');
      return;
    }
  
    const newProperty = {
      title,
      color,
      mainCarrefour,
      distanceFromRoad,
    };
  
    setLoading(true);
  
    try {
      const aiResult = await aiDescription(newProperty);
      setValue('description', aiResult.result);
      setIsDialogOpen(false);
      setValue('color', '');
      setValue('mainCarrefour', '');
      setValue('distanceFromRoad', 0);
      toast.success('AI description generated successfully!');
    } catch (error) {
      console.error('Error generating AI description:', error);
      toast.error('Failed to generate AI description. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  


  const handleAddPlace = () => {
    const newPlace = { name: '', distance: 0, type: '' };

    switch (selectedCategory) {
      case 'hospital':
        hospitalFields.append(newPlace);
        break;
      case 'school':
        schoolFields.append(newPlace);
        break;
      case 'market':
        restaurantFields.append(newPlace);
        break;
      default:
        break;
    }
  };

  const renderFields = (fields: any, remove: (index: number) => void) => (
    <>
      {fields.map((field: any, index: number) => (
        <div key={field.id} className='space-y-4 pt-5'>
          <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 md:items-end gap-6'>
            <div className='w-full'>
              <Label htmlFor={`${selectedCategory}.${index}.name`} className='text-customGrey'>Name of the place</Label>
              <Controller
                name={`${selectedCategory}.${index}.name`}
                control={control}
                render={({ field }) => <Input {...field} placeholder='Name of the place' className='mt-4 w-full' required />}
              />
            </div>
            <div>
              <Label htmlFor={`${selectedCategory}.${index}.distance`} className='text-customGrey'>Distance (km)</Label>
              <Controller
                name={`${selectedCategory}.${index}.distance`}
                control={control}
                render={({ field }) => <Input {...field} type='number' placeholder='Distance (km)' className='mt-4' required />}
              />
            </div>
            <div>
              <Label htmlFor={`${selectedCategory}.${index}.type`} className='text-customGrey'>Type</Label>
              <Controller
                name={`${selectedCategory}.${index}.type`}
                control={control}
                render={({ field }) => <Input {...field} placeholder='Type' className='mt-4' required />}
              />
            </div>
            <Button className='bg-red-500 w-12' type='button' onClick={() => remove(index)}>
              <X className='h-4 w-4' />
            </Button>
          </div>

        </div>
      ))}
    </>
  );

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    setIsSubmitting(true);
   
    try {
      let imageUrls: string[] = [];
      let videoUrl: string | null = null;

      // Handle images - only upload new ones if they're File objects
      if (data.images && data.images.length > 0) {
        const newImages = Array.from(data.images).filter(img => img instanceof File);
        if (newImages.length > 0) {
          imageUrls = await uploadToS3(newImages);
        } else {
          // Use existing images if no new ones uploaded
          imageUrls = selectedImages.filter(img => typeof img === 'string');
        }
      } else if (selectedImages.length > 0) {
        imageUrls = selectedImages.filter(img => typeof img === 'string');
      }

      if (data.video) {
        videoUrl = await uploadVideoToS3(data.video);
      }

      const formDat = {
        ...data,
        lat: parseFloat(data.lat?.toString() ?? '0'),
        lng: parseFloat(data.lng?.toString() ?? '0'),
        price: parseFloat(data.price?.toString() ?? '0'),
        bedrooms: parseInt(data.bedrooms?.toString() ?? '0'),
        bathrooms: parseInt(data.bathrooms?.toString() ?? '0'),
        kitchen: parseInt(data.kitchen?.toString() ?? '0'),
        propertyNumber: parseInt(data.propertyNumber?.toString() ?? '0'),
        images: imageUrls,
        video: videoUrl,
        hospital: data.hospital.map((hospital) => ({
          name: hospital.name,
          distance: parseFloat(hospital.distance.toString()),
          type: hospital.type,
        })),
        school: data.school.map((school) => ({
          name: school.name,
          distance: parseFloat(school.distance.toString()),
          type: school.type,
        })),
        market: data.market.map((market) => ({
          name: market.name,
          distance: parseFloat(market.distance.toString()),
          type: market.type,
        })),
      };

      if (isEditMode && editingPropertyId) {
        await updateProperty(editingPropertyId, formDat);
        toast.success("Property updated successfully.");
      } else {
        await createProperty(formDat);
        toast.success("Property created successfully.");
      }
      
      reset();
      router.push('/dashboard');

    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(isEditMode ? "Failed to update property." : "Failed to create property.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = () => {
    if (watch('title') && watch('categoryId')) {
      setShowSecondSection(true);
    } else {
      toast.error('Please fill in all fields before continuing.');
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    setClickedLocation({ latitude: lat, longitude: lng });
  }
  const address = {
    latitude: cityAddress.latitude, longitude: cityAddress.longitude,
  };

  const handleImageChange = (e) => {
    const files = e.target.files;
    const newImages = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onloadend = () => {
        newImages.push(reader.result);
        if (newImages.length === files.length) {
          setSelectedImages((prev) => prev.concat(newImages));
        }
      };

      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (index) => {
    const updatedImages = [...selectedImages];
    updatedImages.splice(index, 1);
    setSelectedImages(updatedImages);
  };

  return (
    <section className=' w-[100%] mt-[7.5rem] sm:mt-[5rem] bg-secondaryColor   md-[1000px]:w-[80%]  lg:max-w-[90%]  p-4   sm:p-8  float-right'>
      <div >
        <h3 className='text-3xl mb-8'>{isEditMode ? 'Edit Property' : 'Submit Property'}</h3>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-8 bg-white p-4 md:p-8 rounded-lg shadow-md'>
          <h2 className='text-xl font-semibold'>Basic Information</h2>
          <hr />
          {
            !showSecondSection && (
              <div className=' '>
                <div>
                  <Label htmlFor='title' className='text-customGrey'>Property Title</Label>
                  <Controller
                    name='title'
                    control={control}
                    render={({ field }) => <Input {...field} className='w-full mt-4 h-16' required />}
                  />
                </div>
                <div className='mt-4'>
                  <Label htmlFor='categoryId' className='text-customGrey'>Category</Label>
                  <Controller
                    name='categoryId'
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className='w-full mt-4 mb-8 h-16'>
                          <SelectValue placeholder='Select a category' />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectGroup>
                            {categories.length > 0 ? (
                              categories.map((category: { id: number, name: string }, index: number) => (
                                <SelectItem key={index} value={category.id.toString()}>{category.name.charAt(0).toUpperCase() + category.name.slice(1)}</SelectItem>
                              ))
                            ) : (
                              <SelectItem value="loading">Loading categories...</SelectItem>
                            )}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            )
          }

          {!showSecondSection && (
            <Button type='button' className='bg-primaryColor' onClick={handleContinue}>
              Continue
            </Button>
          )}

          {showSecondSection && (
            <>
              {/* Price section */}
              <div>
                <Label htmlFor='lng' className='text-customGrey'>Price</Label>
                <Controller
                  name='price'
                  control={control}
                  render={({ field }) => <Input {...field} type='number' className='mt-4 h-14' required />}
                />
              </div>

              {/* number of rooms section */}
              {watch('categoryId') === 'cm0gm8l1g00003wrb4iyb03k2' && (

              <div className='flex w-full gap-1 md:gap-2 lg:gap-6'>
                <div className='w-full'>
                  <Label htmlFor='lng' className='text-customGrey'>No bedroom</Label>
                  <Controller
                    name='bedrooms'
                    control={control}
                    render={({ field }) => <Input {...field} className='w-full mt-4 h-14' type='number' required />}
                  />
                </div>
                <div className='w-full'>
                  <Label htmlFor='lng' className='text-customGrey'>No bathroom</Label>
                  <Controller
                    name='bathrooms'
                    control={control}
                    render={({ field }) => <Input {...field} className='w-full mt-4 h-14' type='number' required />}
                  />
                </div>
                <div className='w-full'>
                  <Label htmlFor='lng' className='text-customGrey'>No Kitchen</Label>
                  <Controller
                    name='kitchen'
                    control={control}
                    render={({ field }) => <Input {...field} className='w-full mt-4 h-14' type='number' required />}
                  />
                </div>
              </div>
            )}

              <div className='flex w-full gap-1 md:gap-2 lg:gap-6'>
                <div className=' w-full'>
                  <Label htmlFor='lng' className='text-customGrey'>No Property</Label>
                  <Controller
                    name='propertyNumber'
                    control={control}
                    render={({ field }) => <Input {...field} className='w-full mt-4 h-14' type='number' required />}
                  />
                </div>
                <div className=" w-full">
                  <Label htmlFor='category' className='text-customGrey'>Water source</Label>
                  <Controller
                    name='water'
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className='w-full mt-4 mb-8 h-14'>
                          <SelectValue placeholder='Select a water source' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="borehole">
                              borehole
                            </SelectItem>
                            <SelectItem value="river">
                              river
                            </SelectItem>
                            <SelectItem value="tank">
                              tank
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className='w-full'>
                  <Label htmlFor='category' className='text-customGrey'>Electricity</Label>
                  <Controller
                    name='electricity'
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className='w-full mt-4 mb-8 h-14'>
                          <SelectValue placeholder='Select a metal type' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="prepaid">
                              prepaid
                            </SelectItem>
                            <SelectItem value="postpaid">
                              postpaid
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              {/* storage section */}

              <div className="flex items-center gap-5 space-x-2">
                <Label htmlFor='hasStorage' className='  md:text-base font-normal text-customGrey'>Any Storage or garage present?</Label>
                <Controller
                  name="hasStorage"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center">
                      <span className="mr-2 text-sm  text-customGrey">No</span>
                      <Switch
                        id="hasStorage"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="h-8 w-14"
                      />
                      <span className="ml-2 text-sm  text-customGrey">Yes</span>
                    </div>
                  )}
                />
              </div>


              <div className='pt-9 w-full'><h2 className='text-xl font-semibold'>Property description</h2>
                <hr className='mt-8 mb-4'></hr>
              </div>
              {/* description section */}
              <div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" className="bg-primaryColor hover:bg-green-400">
                      Ask AI to write description
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Property Details</DialogTitle>
                    </DialogHeader>
                    <div>
                      <p className="text-customGrey text-sm">Please provide the following Information to the AI</p>
                    </div>
                    <div className="grid gap-4 py-4">
                      <div className="">
                        <Label htmlFor="color" className="text-right text-customGrey text-xs">
                          Color of the property
                        </Label>
                        <Controller
                          name="color"
                          control={control}
                          rules={{ required: 'Color is required' }}
                          render={({ field }) => (
                            <>
                              <Input id="color" className="col-span-3 mt-3" {...field} />
                              {errors.color && <p className="text-red-500 text-xs mt-1">{errors.color.message}</p>}
                            </>
                          )}
                        />
                      </div>
                      <div className="">
                        <Label htmlFor="mainCarrefour" className="text-right text-customGrey text-xs">
                          Main Carrefour from the property
                        </Label>
                        <Controller
                          name="mainCarrefour"
                          control={control}
                          rules={{ required: 'Main Carrefour is required' }}
                          render={({ field }) => (
                            <>
                              <Input id="mainCarrefour" className="col-span-3 mt-3" {...field} />
                              {errors.mainCarrefour && <p className="text-red-500 text-xs mt-1">{errors.mainCarrefour.message}</p>}
                            </>
                          )}
                        />
                      </div>
                      <div className="items-center gap-4">
                        <Label htmlFor="distanceFromRoad" className="text-right text-customGrey text-xs">
                          Distance from Road main to the property
                        </Label>
                        <Controller
                          name="distanceFromRoad"
                          control={control}
                          rules={{ required: 'Distance from the road is required', min: 0 }}
                          render={({ field }) => (
                            <>
                              <Input id="distanceFromRoad" type="number" className="col-span-3 mt-3" {...field} />
                              {errors.distanceFromRoad && (
                                <p className="text-red-500 text-xs mt-1">{errors.distanceFromRoad.message}</p>
                              )}
                            </>
                          )}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                    <Button type="button" className="bg-primaryColor text-white" onClick={handleSubmit(onSubmitt)} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Description'
            )}
          </Button>

                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>


              <div className='space-y-6'>
                <h2 className=' text-customGrey font-semibold'>Description</h2>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => <Textarea {...field} className='h-60 bg-secondaryColor' required />}
                />
              </div>

              <div className='space-y-8 flex flex-col gap-1 justify-center pt-5 md:pt-10 items-center'>
                <h2 className='text-2xl font-semibold w-full'>Property Location</h2>
                <hr className='w-full' />
                <div className='flex w-full flex-col gap-4'>
                  <div className='w-full'>
                    <Label htmlFor='address' className='text-customGrey font-semibold'>Address</Label>
                    <Controller
                      name='address'
                      control={control}
                      render={({ field }) => <Input {...field} className='h-14 mt-4 w-full' required />}
                    />
                  </div>
                  <div className='flex w-full h-[400px] md:h-[500px] mb-10 gap-4 justify-center'>
                    <div className='w-full  max-w-[800px]'>
                      <p className='mb-6 text-red-500'>Please shot your property on the map below.</p>
                      <LocationN address={address} onMapClick={handleMapClick} />
                      <span id='locationError' style={{ color: 'red', fontSize: 13, display: 'none' }}> Location needed!</span>
                    </div>
                  </div>

                </div>
              </div>

              <div className='pt-9 md:pt-16 w-full'>
                <h2 className='text-xl font-semibold'>Property security</h2>
                <hr className='w-full mt-6' />

                <div className='w-full flex flex-col mt-9 gap-5 md:gap-9'>
                  <div className="flex items-center gap-5 space-x-2">
                    <Label htmlFor='gate' className='md:text-base font-normal text-customGrey'>Present of a gate?</Label>
                    <Controller
                      name="gate"
                      control={control}
                      render={({ field }) => (
                        <div className="flex items-center">
                          <span className="mr-2 text-customGrey">No</span>
                          <Switch
                            id="gate"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="h-8 w-14"
                          />
                          <span className="ml-2 text-customGrey">Yes</span>
                        </div>
                      )}
                    />
                  </div>
                  <div className="flex items-center gap-5 space-x-2">
                    <Label htmlFor='gateman' className='md:text-base font-normal text-customGrey'>present of a gateman?</Label>
                    <Controller
                      name="gateman"
                      control={control}
                      render={({ field }) => (
                        <div className="flex items-center">
                          <span className="mr-2 text-customGrey">No</span>
                          <Switch
                            id="gateman"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="h-8 w-14"
                          />
                          <span className="ml-2 text-customGrey">Yes</span>
                        </div>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className='space-y- pt-10'>
                <h2 className='text-xl font-semibold mb-5'>Property Photos And Video</h2>
                <Controller
                  name="images"
                  control={control}
                  render={({ field }) => (
                    <div className="container">
                      <input
                        className="custom-file-input"
                        type="file"
                        onChange={(e) => {
                          field.onChange(e.target.files);
                          handleImageChange(e);
                        }}
                        multiple

                      />
                      <div className="preview-container bg-secondaryColor">
                        {selectedImages?.map((image, index) => (
                          <div key={index} className="image-preview">
                            <img src={image} className='imageFile' alt={`Preview ${index + 1}`} />
                            <button className='preview-remove' onClick={() => handleRemoveImage(index)}>
                              <CircleX style={{ fontSize: '15' }} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <span id='imageError' style={{ color: 'red', fontSize: 13, display: 'none' }}>Images needed!</span>
                    </div>
                  )}
                />
              </div>

              <p className='text-xl font-semibold '>Video</p>

              <div className="items-center gap-4">
                <Label className="text-right text-customGrey">Add a video</Label>
                <Controller
                  name="video"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="file"
                      accept="video/*"
                      className="col-span-3 mt-3"
                      onChange={(e) => {
                        const file = e.target.files ? e.target.files[0] : null;
                        field.onChange(file);
                      }}
                    />
                  )}
                />
              </div>

              <div className='space-y-6 pt-10 pb-10'>
                <h2 className='text-xl font-semibold'>Add nearby places</h2>
                <hr className='w-full mt-6' />
                <div className='flex w-full pt-5 bg-secondaryColor'>
                  {['hospital', 'school', 'market'].map((category) => (
                    <button
                      key={category}
                      type='button'
                      className={`px-4 py-4 ${selectedCategory === category
                          ? 'bg-primaryColor text-white'
                          : 'bg-gray-100 text-gray-700'
                        } rounded`}
                      onClick={() => setSelectedCategory(category as 'hospital' | 'school' | 'market')}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Dynamic Field Rendering */}
                <div className='mt-5'>
                  {selectedCategory === 'hospital' && renderFields(hospitalFields.fields, hospitalFields.remove)}
                  {selectedCategory === 'school' && renderFields(schoolFields.fields, schoolFields.remove)}
                  {selectedCategory === 'market' && renderFields(restaurantFields.fields, restaurantFields.remove)}
                </div>

                {/* Add Place Button */}
                <Button type='button' onClick={handleAddPlace} className='bg-primaryColor flex items-center justify-center hover:bg-green-500'>
                  <Plus className=' h-4 w-4' />
                </Button>
              </div>
              <Button type='submit' className='m-auto p-5 bg-primaryColor flex items-center justify-center hover:bg-green-500'>
                {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Please wait
                                </>
                            ):  (
                              isEditMode ? 'Update Property' : 'Submit Property'
                          )}
              </Button>
            </>
          )}
        </form>
      </div>
    </section>
  );
}
