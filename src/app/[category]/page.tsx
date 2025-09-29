// @ts-nocheck
"use client"
import GoogleMap from "@/components/googleMap";
import Navbar from "@/components/navbar";
import SearchForm from "@/components/searchForm";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { MdAccountCircle } from "react-icons/md";
import { CalendarClock,MapPin, StarIcon } from "lucide-react";
import Footer from "@/components/footer";
import { useParams } from 'next/navigation'
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import Link from "next/link";
import AiFeature from "@/components/ai";
import { useUser } from "@clerk/nextjs";

export default function Page() {
  const params = useParams()
  const {category} = params
  const { properties } = useSelector((state: any) => state.property);
  const { user } = useUser()
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)

  const apartmentProperties = properties.filter((property: any) => property.category.name === category);

  useEffect(() => {
    if (apartmentProperties.length > 0) {
      setIsLoading(false)
    }
  }, [apartmentProperties])

  const handleUserClick = (user: any) => {
    setSelectedUser(user)
  }
  return (
    <section className="flex w-full flex-col   items-center justify-center pt-26">
    <Navbar />
    <div className="flex flex-col items-center w-full mt-24  w-full h-[70vh] justify-center">
      <GoogleMap  items={apartmentProperties} />
    </div>
    <div className="w-full flex justify-center p-2 pt-6 pb-8 md:p-4 md:pt-8 md:pb-12 items-center bg-[#F5F5F5] ">
      <SearchForm />
    </div>
    <main className="w-full max-w-[1350px] mb-10 md:mb-20 flex flex-col p-2 md:p-4 items-center justify-center">

      <div className="w-full flex flex-col items-center justify-center pt-12">
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-3xl md:text-4xl font-comfortaa   ">
            Recent {category.charAt(0).toUpperCase() + category.slice(1)}s
          </h1>

          <hr className='mt-6 h-[2px] border-none bg-primaryColor w-24' />

          <hr className='mb-4 mt-2 h-[2px] border-none bg-primaryColor w-12' />
        </div>

        <div className="w-full pt-8 md:pt-12 p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="flex items-center justify-center w-full col-span-1 md:col-span-2 lg:col-span-3">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              apartmentProperties.length > 0 ? (
               
          apartmentProperties.map((property: any) => {
            return(
              <div key={property.id} className="w-full flex justify-center items-center overflow-hidden shadow-xl md:shadow-2xl">
              <div className="flex flex-col gap-2 items-center justify-center w-full max-w-[450px] transition-transform duration-300 hover:scale-105 shadow-lg ">
                <div>
                <div className="relative w-full h-full bg-black bg-opacity-50">
  
                  <Carousel className="w-full">
                    <CarouselContent>
                      {property.images.map((image: any, index: number) => (
                        <CarouselItem key={index}>
                          <div className="relative w-full h-[300px]">
                            <img src={image} className="brightness-75 w-full h-full"  alt="imageojck" />
                            <div className="absolute inset-0 bg-black opacity-20"></div>
                          </div> 
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-3 bg-slate hover:bg-white" />
                    <CarouselNext className="right-3 bg-slate  hover:bg-white" />
                  </Carousel>
                  <h1 className="absolute top-3 right-3 p-2 bg-customBlack rounded text-secondaryColor">{property.category.name.charAt(0).toUpperCase() + property.category.name.slice(1)}</h1>
                  <h1 className="absolute bottom-3 left-3 p-2 text-primaryColor text-2xl">{property.price} CFA</h1>
                  <p className="absolute bottom-3 right-3 p-2 text-white text-2xl"><StarIcon /></p>
                </div>
                <div className="flex w-full flex-col gap-2 items-center justify-center">
                  <div className="flex flex-col p-2 gap-1 w-full "   onClick={() => window.location.href = `/${category}/${property.id}`}>
                  <Link href={`/${category}/${property.id}`} className="font-comfortaa text-customBlack hover:text-primaryColor cursor-pointer hover:transition-colors hover:duration-300 transition-colors duration-300 text-2xl md:text-3xl">{property.title.charAt(0).toUpperCase() + property.title.slice(1)}</Link>
                  <div className="flex gap-2 items-center">
                      <MapPin className="text-primaryColor w-4 h-4" />
                    <p className="font-muli text-customGrey">{property.address}</p>
                    </div>
                    
                  </div>
                  <div className="w-full">
                  {
                                property.category.name === 'apartment'? (
                                  <ul className="flex bg-secondaryColor items-end p-4 justify-evenly w-full ">
                                  <li>
                                      <p>{property.bedrooms}</p>
                                      <p className="text-customGrey text-sm mt-2" >Bedroom</p>
                                  </li>
                                  <li>
                                      <p>{property.bathrooms}</p>
                                      <p className="text-customGrey text-sm mt-2">Bathroom</p>
                                  </li>
                                  <li>
                                      <p>{property.hasStorage ? 'Yes' : 'No'}</p>
                                      <p className="text-customGrey text-sm mt-2">Storage</p>
                                  </li>
                                  <li>
                                      <p className="text-primaryColor text-sm">More+</p>
                                  </li>
                              </ul>
                                ) : (
                              <div></div>
                                )
                            }
                  </div>
  
                  <div className="flex p-4 shadow-xl  md:shadow-none gap-2 items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                  {
                    user ? (
                      <img
                      className="w-8 h-8 bg-black rounded-full object-cover"
                      src={property.user.image} // Replace with your profile image path
                      alt="Profile"
                      onClick={() => handleUserClick(property.user)}
                  />
                    ) : (<p><MdAccountCircle size={28} className="text-primaryColor" /></p>)
                  }                      <p className="text-customGrey text-sm">{property.user.firstName}</p>
                    </div>
                    <div className="flex items-center gap-2" >
                      <p><CalendarClock className="text-primaryColor" /></p>
                      <p className="text-customGrey text-sm">{new Date(property.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
  
                  </div>
                </div>
              </div>
            </div>
              </div>
            )
          })) : (
                <div className="flex items-center justify-center w-full col-span-1 md:col-span-2 lg:col-span-3">
                  <div ><p className="text-sm text-customGrey text-center">No property to show</p></div>
                </div>
              )
            )}
          </div>
      </div>


    </main>

    <Footer />

    {selectedUser && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">User Information</h2>
          <p><strong>Name:</strong> {selectedUser.firstName} {selectedUser.lastName}</p>
          <p><strong>Email:</strong> {selectedUser.email}</p>
          <p><strong>Phone:</strong>  <a href={`https://wa.me/${parseInt(selectedUser.phone.slice(1))}`} className="text-primaryColor" target="_blank">Chat via whatApp</a></p>
          <button 
            onClick={() => setSelectedUser(null)}
            className="mt-4 bg-primaryColor text-white px-4 py-2 rounded"
          >
            Close
          </button>
        </div>
      </div>
    )}
<AiFeature />
  </section>
  );
}
