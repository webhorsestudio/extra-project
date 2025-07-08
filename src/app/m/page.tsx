"use client";
import { useFooterVisible } from '@/components/mobile/FooterVisibleContext';
import { useEffect, useState } from 'react';
import CategoryBar from '@/components/mobile/CategoryBar';
import PropertyCard from '@/components/mobile/PropertyCard';
import BlogCard from '@/components/mobile/BlogCard';
import { EnquiryModal } from '@/components/mobile/EnquiryModal';

export default function MobileHomePage() {
  const footerVisible = useFooterVisible();
  const [properties, setProperties] = useState<any[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [latestProperties, setLatestProperties] = useState<any[]>([]);
  const [loadingLatest, setLoadingLatest] = useState(true);
  const [newlyLaunchedProperties, setNewlyLaunchedProperties] = useState<any[]>([]);
  const [loadingNewlyLaunched, setLoadingNewlyLaunched] = useState(true);
  const [localities, setLocalities] = useState<any[]>([]);
  const [loadingLocalities, setLoadingLocalities] = useState(true);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);

  useEffect(() => {
    setLoadingProperties(true);
    fetch('/api/mobile/properties?limit=6&property_collection=Featured')
      .then(res => res.json())
      .then(data => {
        setProperties(data.properties || []);
        setLoadingProperties(false);
      })
      .catch(() => {
        setProperties([]);
        setLoadingProperties(false);
      });
    setLoadingLatest(true);
    fetch('/api/mobile/properties?limit=6&sort=created_at_desc')
      .then(res => res.json())
      .then(data => {
        setLatestProperties(data.properties || []);
        setLoadingLatest(false);
      })
      .catch(() => {
        setLatestProperties([]);
        setLoadingLatest(false);
      });
    setLoadingNewlyLaunched(true);
    fetch('/api/mobile/properties?limit=6&property_collection=Newly Launched')
      .then(res => res.json())
      .then(data => {
        setNewlyLaunchedProperties(data.properties || []);
        setLoadingNewlyLaunched(false);
      })
      .catch(() => {
        setNewlyLaunchedProperties([]);
        setLoadingNewlyLaunched(false);
      });
    setLoadingLocalities(true);
    fetch('/api/mobile/locations')
      .then(res => res.json())
      .then(data => {
        setLocalities(data.locations || []);
        setLoadingLocalities(false);
      })
      .catch(() => {
        setLocalities([]);
        setLoadingLocalities(false);
      });
    setLoadingBlogs(true);
    fetch('/api/blogs?limit=6')
      .then(res => res.json())
      .then(data => {
        setBlogs(data.blogs || []);
        setLoadingBlogs(false);
      })
      .catch(() => {
        setBlogs([]);
        setLoadingBlogs(false);
      });
  }, []);

  useEffect(() => {
    // Fetch categories from API
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(data.categories || []);
        setLoadingCategories(false);
      })
      .catch(() => {
        // Fallback to mock categories if API fails
        setCategories([
          { id: '1', name: 'Apartment', icon: 'Home' },
          { id: '2', name: 'Villa', icon: 'Castle' },
          { id: '3', name: 'Office', icon: 'Building2' },
          { id: '4', name: 'Shop', icon: 'Store' },
          { id: '5', name: 'Plot', icon: 'Map' },
        ]);
        setLoadingCategories(false);
      });
  }, []);

  return (
    <div className="space-y-8 relative">
      {/* Category Bar directly below header */}
      {loadingCategories ? (
        <div className="w-full h-16 flex items-center justify-center bg-white border-b border-gray-100 mt-4">
          <span className="text-gray-400 text-sm">Loading categories...</span>
        </div>
      ) : (
        <div className="mt-4">
          <CategoryBar categories={categories} barHeightClass="h-16 py-2.5" />
        </div>
      )}

      {/* Need Help? Section - Hero-style design */}
      <div className="relative bg-white w-full flex flex-col justify-center items-center py-8 px-4">
        <div className="w-full flex flex-col items-center justify-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-center text-gray-900 mb-2">
            The Ultimate Address for your Luxury Homes
          </h1>
          <p className="text-base text-center text-gray-700 mb-6">
            Discover the best homes for you & your family
          </p>
          <EnquiryModal
            trigger={
              <span
                className="px-8 py-3 rounded-full text-white text-base font-medium shadow-md cursor-pointer"
                style={{
                  background: 'linear-gradient(120deg, #181f2c 60%, #a0a3aa 100%)',
                  display: 'inline-block',
                }}
              >
                Get Started
              </span>
            }
            companyName="Extra Realty"
            contactEmail=""
            contactPhone=""
            whatsappUrl=""
          />
        </div>
      </div>

      {/* Latest Properties - Modern carousel design */}
      <section className="pt-2">
        {loadingLatest ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-gray-400 text-base">Loading properties...</span>
          </div>
        ) : latestProperties.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No latest properties available.</p>
          </div>
        ) : (
          <>
            <div className="relative">
              <div className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-2 pb-2 snap-x snap-mandatory">
                {latestProperties.slice(0, 6).map((property: any, idx: number) => (
                  <div key={property.id} className="flex-shrink-0 w-96 snap-center">
                    <PropertyCard property={property} />
                  </div>
                ))}
              </div>
              {/* Carousel Dots */}
              <div className="flex items-center justify-center gap-2 mt-3">
                {latestProperties.slice(0, 6).map((_, idx) => (
                  <span key={idx} className="w-2 h-2 rounded-full bg-gray-300" />
                ))}
              </div>
            </div>
          </>
        )}
      </section>

      {/* Featured Properties - Modern carousel design */}
      <section className="pt-2">
        <div className="flex items-center justify-between px-2 mb-4">
          <h3 className="text-2xl font-bold text-gray-900">Featured Properties</h3>
        </div>
        {loadingProperties ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-gray-400 text-base">Loading properties...</span>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No featured properties available.</p>
          </div>
        ) : (
          <>
            <div className="relative">
              <div className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-2 pb-2 snap-x snap-mandatory">
                {properties.slice(0, 6).map((property: any, idx: number) => (
                  <div key={property.id} className="flex-shrink-0 w-96 snap-center">
                    <PropertyCard property={property} />
                  </div>
                ))}
              </div>
              {/* Carousel Dots */}
              <div className="flex items-center justify-center gap-2 mt-3">
                {properties.slice(0, 6).map((_, idx) => (
                  <span key={idx} className="w-2 h-2 rounded-full bg-gray-300" />
                ))}
              </div>
            </div>
          </>
        )}
      </section>

      {/* Newly Launched - Modern carousel design */}
      <section className="pt-2">
        <div className="flex items-center justify-between px-2 mb-4">
          <h3 className="text-2xl font-bold text-gray-900">Newly Launched</h3>
        </div>
        {loadingNewlyLaunched ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-gray-400 text-base">Loading properties...</span>
          </div>
        ) : newlyLaunchedProperties.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No newly launched properties available.</p>
          </div>
        ) : (
          <>
            <div className="relative">
              <div className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-2 pb-2 snap-x snap-mandatory">
                {newlyLaunchedProperties.slice(0, 6).map((property: any, idx: number) => (
                  <div key={property.id} className="flex-shrink-0 w-96 snap-center">
                    <PropertyCard property={property} />
                  </div>
                ))}
              </div>
              {/* Carousel Dots */}
              <div className="flex items-center justify-center gap-2 mt-3">
                {newlyLaunchedProperties.slice(0, 6).map((_, idx) => (
                  <span key={idx} className="w-2 h-2 rounded-full bg-gray-300" />
                ))}
              </div>
            </div>
          </>
        )}
      </section>

      {/* Localities you may like - Modern carousel design */}
      <section className="pt-2">
        <div className="flex items-center justify-between px-2 mb-4">
          <h3 className="text-2xl font-bold text-gray-900">Localities you may like</h3>
        </div>
        {loadingLocalities ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-gray-400 text-base">Loading localities...</span>
          </div>
        ) : localities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No localities found.</p>
          </div>
        ) : (
          <>
            <div className="relative">
              <div className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-2 pb-2 snap-x snap-mandatory">
                {localities.slice(0, 12).map((loc: any) => (
                  <a
                    key={loc.id}
                    href={`/m/properties?location=${loc.id}&locationName=${encodeURIComponent(loc.name)}`}
                    className="flex flex-col items-start bg-white rounded-2xl px-6 py-5 min-w-[200px] max-w-[220px] shadow border border-gray-100 hover:shadow-xl hover:border-blue-400 transition-shadow duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 snap-center"
                  >
                    {loc.image_url ? (
                      <img src={loc.image_url} alt={loc.name} className="w-full h-24 object-cover rounded-xl mb-3 border" />
                    ) : (
                      <div className="w-full h-24 bg-gray-100 rounded-xl mb-3 flex items-center justify-center text-gray-400">
                        <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 20V10a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v10M12 4v6m0 0-2-2m2 2 2-2"/></svg>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-1 text-gray-700">
                      <span className="font-semibold text-lg text-gray-900">{loc.property_count} {loc.property_count === 1 ? 'property' : 'properties'}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-gray-600">
                      <span className="font-medium text-base">{loc.name}</span>
                    </div>
                  </a>
                ))}
              </div>
              {/* Carousel Dots */}
              <div className="flex items-center justify-center gap-2 mt-3">
                {Array.from({ length: Math.ceil(localities.length / 3) }).map((_, idx) => (
                  <span key={idx} className="w-2 h-2 rounded-full bg-gray-300" />
                ))}
              </div>
            </div>
          </>
        )}
      </section>

      {/* Latest Blogs - Modern carousel design */}
      <section className="pt-2">
        <div className="flex items-center justify-between px-2 mb-4">
          <h3 className="text-2xl font-bold text-gray-900">Latest Blogs</h3>
        </div>
        {loadingBlogs ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-gray-400 text-base">Loading blogs...</span>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No blog posts available.</p>
          </div>
        ) : (
          <>
            <div className="relative">
              <div className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-2 pb-2 snap-x snap-mandatory">
                {blogs.map((blog: any) => (
                  <div key={blog.id} className="flex-shrink-0 w-80 snap-center">
                    <BlogCard blog={blog} />
                  </div>
                ))}
              </div>
              {/* Carousel Dots */}
              <div className="flex items-center justify-center gap-2 mt-3">
                {blogs.map((_: any, idx: number) => (
                  <span key={idx} className="w-2 h-2 rounded-full bg-gray-300" />
                ))}
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
} 