// @ts-nocheck
'use server'
import { NextResponse } from 'next/server';

import { prisma } from "@/lib/db";
import { openai } from "@/lib/openai";

export async function getAllCategories() {
  try {
    return await prisma.category.findMany();
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw new Error("Failed to fetch categories");
  }
}

export async function getFirstUser() {
  try {
    return await prisma.user.findFirst({
      include: {
      properties: {
        include: {
          category: true,
          user: true,
          hospitals: true,
          schools: true,
          markets: true,
        }
      }
    }}
    );
  } catch (error) {
    console.error("Error fetching first user:", error);
    throw new Error("Failed to fetch first user");
  }
}

export async function getUserById(id: string) {
  try {
    return await prisma.user.findUnique({
      where: {
        clerkUserId: id,
      },
      include: {
        properties: {
          include: {
            category: true,
            user: true,
            hospitals: true,
            schools: true,
            markets: true,
          }
        }
      }
    });
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    throw new Error("Failed to fetch user by ID");
  }
}
export async function createProperty(data: {
  title: string;
  price?: number;
  categoryId: string;
  description: string;
  bedrooms?: number;
  bathrooms?: number;
  kitchen?: number;
  propertyNumber?: number;
  water: string;
  electricity: string;
  hasStorage: boolean;
  address: string;
  lat?: number;
  lng?: number;
  gate: boolean;
  gateman: boolean;
  images: string[];
  video?: string;
  userId: string;
  hospital: Array<{
    name: string;
    distance: string;
    type: string;
  }>
  school: Array<{
    name: string;
    distance: string;
    type: string;
  }>
  market: Array<{
    name: string;
    distance: string;
    type: string;
  }>
}) {
  try {
    const property = await prisma.property.create({
      data: {
        title: data.title,
        price: data.price,
        description: data.description,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        kitchen: data.kitchen,
        propertyNumber: data.propertyNumber,
        water: data.water,
        electricity: data.electricity,
        hasStorage: data.hasStorage,
        address: data.address,
        lat: data.lat,
        lng: data.lng,
        gate: data.gate,
        gateman: data.gateman,
        images: data.images,
        video: data.video,
        category: {
          connect: {
            id: data.categoryId,
          },
        },
        user: {
          connect: {
            id: data.userId,
          },
        },
        hospitals: {
          create: data.hospital.map((hospital: any) => ({
            name: hospital.name,
            distance: hospital.distance,
            type: hospital.type,
          }))
        },
        schools: {
          create: data.school.map((school: any) => ({
            name: school.name,
            distance: school.distance,
            type: school.type,
          }))
        },
        markets: {
          create: data.market.map((market: any) => ({
            name: market.name,
            distance: market.distance,
            type: market.type,
          }))
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        category: true,
        user: true,
        hospitals: true,
        schools: true,
        markets: true,
      }
    });
    return property;
  } catch (error) {
    console.error("Error creating property:", error);
    throw new Error("Failed to create property");
  }
}


export const aiDescription = async (userData: { 
  title: string; 
  color: string; 
  mainCarrefour: string; 
  distanceFromRoad: number 
}) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // or "gpt-4" if you have access
      messages: [
        {
          role: "system",
          content: "You are a real estate description writer. Always respond with valid JSON containing a 'description' field."
        },
        {
          role: "user",
          content: `Write a description for a rental property with these attributes:
                   - Name: ${userData.title}
                   - Color: ${userData.color}
                   - Main carrefour: ${userData.mainCarrefour}
                   - Distance from main road: ${userData.distanceFromRoad}m
                   
                   Write an attractive 300-word description in simple English. 
                   Respond ONLY with JSON in this format: {"description": "your description here"}`
        }
      ],
      temperature: 0.7,
      // Remove response_format parameter
    });

    const content = completion.choices[0].message.content || '{}';
    const result = JSON.parse(content);
    
    return {
      result: result.description
    };
  } catch (error) {
    console.error('Error during AI description generation:', error);
    throw error;
  }
};



export async function getAllProperties() {
  try {
    const properties = await prisma.property.findMany({
      include: {
        category: true,
        user: true,
        hospitals: true,
        schools: true,
        markets: true,
      }
    });
    return JSON.parse(JSON.stringify(properties));
  } catch (error) {
    console.error("Error fetching properties:", error);
    throw new Error("Failed to fetch properties");
  }
}

export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany();
    return JSON.parse(JSON.stringify(users));
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }
}



export const aiRecommendation = async (userData: string) => {
  console.log(userData);

  try {
    // Get properties with error handling
    const properties = await getAllProperties();

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // or "gpt-4"
      messages: [
        {
          role: "system",
          content: `You are a rental property assistant for Yaoundé. Analyze queries and extract rental criteria.
                   Available categories: apartment, studio, room.
                   Always respond with valid JSON.`
        },
        {
          role: "user",
          content: `Analyze this user query: "${userData}"
                   
                   Determine if they're asking for rental properties. Extract:
                   - category (apartment/studio/room)
                   - address (location in Yaoundé, WITHOUT the word "Yaoundé")
                   - maxPrice, minPrice, or fixedPrice
                   
                   Respond with JSON:
                   {
                     "itsRelatedRental": boolean,
                     "category": string or null,
                     "address": string or null,
                     "maxPrice": number or null,
                     "minPrice": number or null,
                     "fixedPrice": number or null,
                     "generalResponse": string (if not rental-related)
                   }`
        }
      ],
      temperature: 0.3,
      // Remove response_format parameter
    });

    const content = completion.choices[0].message.content || '{}';
    const data = JSON.parse(content);
    let responseText = '';
    let filteredSitess = [];
    
    if (data.itsRelatedRental) {
      const { category, address, maxPrice, minPrice, fixedPrice } = data;

      const filteredSites = properties.filter(property => {
        return (
          (category && property.category.name.toLowerCase().includes(category.toLowerCase())) ||
          (address && property.address.toLowerCase().includes(address.toLowerCase())) ||
          (fixedPrice && property.price === fixedPrice) ||
          (minPrice && maxPrice && (property.price >= minPrice && property.price <= maxPrice))
        );
      });

      if (filteredSites.length > 0) {
        filteredSitess = filteredSites;
        responseText = `Here are some recommended properties for you:`;
      } else {
        responseText = "Sorry, we couldn't find any property matching your need.";
      }
    } else {
      responseText = data.generalResponse || "I can help you find rental properties in Yaoundé. What are you looking for?";
    }
    
    return { responseText, filteredSitess };
  } catch (error) {
    console.error('Error during AI recommendation generation:', error);
    throw error;
  }
};


export async function getAllCategory() {
  try {
    return await prisma.category.findMany({
      include: {
        properties: true,
      },
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw new Error("Failed to fetch categories");
  }
}

export async function updateProperty(id: string, data: {
  title?: string;
  price?: number;
  categoryId?: string;
  description?: string;
  bedrooms?: number;
  bathrooms?: number;
  kitchen?: number;
  propertyNumber?: number;
  water?: string;
  electricity?: string;
  hasStorage?: boolean;
  address?: string;
  lat?: number;
  lng?: number;
  gate?: boolean;
  gateman?: boolean;
  images?: string[];
  video?: string;
  hospital?: Array<{
    name: string;
    distance: string;
    type: string;
  }>
  school?: Array<{
    name: string;
    distance: string;
    type: string;
  }>
  market?: Array<{
    name: string;
    distance: string;
    type: string;
  }>
}) {
  try {
    const updateData: any = {
      ...data,
      updatedAt: new Date(),
    };

    if (data.categoryId) {
      updateData.category = {
        connect: {
          id: data.categoryId,
        },
      };
      delete updateData.categoryId;
    }

    if (data.hospital) {
      await prisma.hospital.deleteMany({
        where: { propertyId: id }
      });
      updateData.hospitals = {
        create: data.hospital.map((hospital: any) => ({
          name: hospital.name,
          distance: hospital.distance,
          type: hospital.type,
        }))
      };
      delete updateData.hospital;
    }

    if (data.school) {
      await prisma.school.deleteMany({
        where: { propertyId: id }
      });
      updateData.schools = {
        create: data.school.map((school: any) => ({
          name: school.name,
          distance: school.distance,
          type: school.type,
        }))
      };
      delete updateData.school;
    }

    if (data.market) {
      await prisma.market.deleteMany({
        where: { propertyId: id }
      });
      updateData.markets = {
        create: data.market.map((market: any) => ({
          name: market.name,
          distance: market.distance,
          type: market.type,
        }))
      };
      delete updateData.market;
    }

    const property = await prisma.property.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        user: true,
        hospitals: true,
        schools: true,
        markets: true,
      }
    });
    return property;
  } catch (error) {
    console.error("Error updating property:", error);
    throw new Error("Failed to update property");
  }
}

export async function deleteProperty(id: string) {
  try {
    await prisma.hospital.deleteMany({
      where: { propertyId: id }
    });

    await prisma.school.deleteMany({
      where: { propertyId: id }
    });

    await prisma.market.deleteMany({
      where: { propertyId: id }
    });

    const property = await prisma.property.delete({
      where: { id }
    });
    return property;
  } catch (error) {
    console.error("Error deleting property:", error);
    throw new Error("Failed to delete property");
  }
}

export async function getPropertyById(id: string) {
  try {
    return await prisma.property.findUnique({
      where: { id },
      include: {
        category: true,
        user: true,
        hospitals: true,
        schools: true,
        markets: true,
      }
    });
  } catch (error) {
    console.error("Error fetching property by ID:", error);
    throw new Error("Failed to fetch property by ID");
  }
}

