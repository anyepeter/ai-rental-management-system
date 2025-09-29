"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Loader2 } from "lucide-react";
import { deleteProperty, getFirstUser } from "@/actions/actions";
import { addUser } from "../../globalRedux/property/propertySlice";

const PropertyList: React.FC = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const user = useSelector((state: any) => state.property.user);
  const properties = user?.properties?.filter(
    (property: any) => property.category.name === "studio"
  );

  useEffect(() => {
    if (user?.properties) {
      setIsLoading(false);
    }
  }, [user]);

  const handleEdit = (propertyId: string) => {
    window.location.href = `/dashboard/addProperty?edit=${propertyId}`;
  };

  const handleDelete = async (propertyId: string) => {
    if (!confirm("Are you sure you want to delete this property?")) {
      return;
    }

    setDeletingId(propertyId);
    try {
      await deleteProperty(propertyId);
      // Update Redux state by removing the deleted property
      const updatedUser = {
        ...user,
        properties: user.properties.filter((property: any) => property.id !== propertyId)
      };
      dispatch(addUser(updatedUser));
      alert("Property deleted successfully!");
    } catch (error) {
      console.error("Error deleting property:", error);
      alert("Failed to delete property. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="w-[100%] mt-[7.5rem] sm:mt-[5rem] md-[1000px]:w-[80%] lg:max-w-[90%] p-4 sm:p-8 float-right">
      <h3 className="text-2xl mt-6 lg:mt-2">Studio</h3>

      {isLoading ? ( // Show loading spinner while waiting for properties
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-gray-500" size={48} />
        </div>
      ) : properties?.length > 0 ? ( // Render table when properties are available
        <div className="w-full mx-auto px-4 py-6 bg-gray-100">
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[1000px] bg-white rounded-lg shadow-md">
              <thead>
                <tr className="text-left bg-gray-100">
                  <th className="py-4 px-6 text-gray-700">Properties</th>
                  <th className="py-4 px-6 text-gray-700">Added Date</th>
                  <th className="py-4 px-6 text-gray-700">Comments</th>
                  <th className="py-4 px-6 text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {properties?.map((property: any) => (
                  <tr key={property.id} className="border-b">
                    <td className="py-4 px-6 flex items-center">
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-28 h-20 object-cover rounded-md mr-4"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {property.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {property.address}
                        </p>
                        <p className="text-green-500 text-sm">
                          {property.price} / {property.category.name}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      {new Date(property.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-4 px-6 text-gray-600">0 Comments</td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(property.id)}
                          className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(property.id)}
                          disabled={deletingId === property.id}
                          className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 disabled:opacity-50"
                        >
                          {deletingId === property.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">No properties available</p>
        </div>
      )}
    </section>
  );
};

export default PropertyList;
