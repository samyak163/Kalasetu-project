import React, { useEffect, useState, useContext } from 'react';
import { ToastContext } from '../../../context/ToastContext.jsx';
import api from '../../../lib/axios.js';
import { API_CONFIG } from '../../../config/env.config.js';
import { optimizeImage } from '../../../utils/cloudinary.js';

const PortfolioTab = () => {
  const { showToast } = useContext(ToastContext);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddProject, setShowAddProject] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [draggedImage, setDraggedImage] = useState(null);
  const [draggedOverIndex, setDraggedOverIndex] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/artisan/portfolio/projects');
      setProjects(response.data.data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      showToast('Failed to load portfolio projects', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (files, projectId) => {
    if (!files || files.length === 0) return;
    
    // Check total images limit
    const project = projects.find(p => p._id === projectId);
    if (project && project.images && project.images.length + files.length > 20) {
      showToast('Maximum 20 images per project', 'error');
      return;
    }

    setUploadingImages(true);
    try {
      const uploadedUrls = [];
      
      for (const file of files) {
        // Validate file
        if (!file.type.startsWith('image/')) {
          showToast(`${file.name} is not an image file`, 'error');
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          showToast(`${file.name} is too large (max 5MB)`, 'error');
          continue;
        }

        // Get Cloudinary signature
        const sigResponse = await api.get('/api/uploads/signature', {
          params: { folder: 'portfolio' }
        });
        const { signature, timestamp, cloudName, api_key } = sigResponse.data;

        // Upload to Cloudinary
        const formData = new FormData();
        formData.append('file', file);
        formData.append('signature', signature);
        formData.append('timestamp', timestamp);
        formData.append('api_key', api_key);
        formData.append('folder', 'portfolio');

        const uploadResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: 'POST',
            body: formData
          }
        );

        const uploadData = await uploadResponse.json();
        if (uploadData.secure_url) {
          uploadedUrls.push(uploadData.secure_url);
        }
      }

      if (uploadedUrls.length > 0) {
        // Add to project
        await api.post(`/api/artisan/portfolio/projects/${projectId}/images`, {
          images: uploadedUrls
        });
        showToast(`Successfully uploaded ${uploadedUrls.length} image(s)`, 'success');
        fetchProjects();
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      showToast('Failed to upload images. Please try again.', 'error');
    } finally {
      setUploadingImages(false);
    }
  };

  const createProject = async (projectData) => {
    try {
      await api.post('/api/artisan/portfolio/projects', projectData);
      showToast('Project created successfully', 'success');
      fetchProjects();
      setShowAddProject(false);
    } catch (error) {
      console.error('Error creating project:', error);
      showToast(error.response?.data?.error || 'Failed to create project', 'error');
    }
  };

  const deleteProject = async (projectId) => {
    if (!confirm('Delete this project? This cannot be undone.')) return;
    
    try {
      await api.delete(`/api/artisan/portfolio/projects/${projectId}`);
      showToast('Project deleted successfully', 'success');
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      showToast('Failed to delete project', 'error');
    }
  };

  const deleteImage = async (projectId, imageUrl) => {
    if (!confirm('Delete this image?')) return;
    
    try {
      await api.delete(`/api/artisan/portfolio/projects/${projectId}/images`, {
        data: { imageUrl }
      });
      showToast('Image deleted successfully', 'success');
      fetchProjects();
    } catch (error) {
      console.error('Error deleting image:', error);
      showToast('Failed to delete image', 'error');
    }
  };

  const setCoverImage = async (projectId, imageUrl) => {
    try {
      await api.patch(`/api/artisan/portfolio/projects/${projectId}/cover`, {
        coverImage: imageUrl
      });
      showToast('Cover image updated', 'success');
      fetchProjects();
    } catch (error) {
      console.error('Error setting cover image:', error);
      showToast('Failed to set cover image', 'error');
    }
  };

  const handleDragStart = (e, imageUrl) => {
    setDraggedImage(imageUrl);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOverIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedImage(null);
    setDraggedOverIndex(null);
  };

  const handleDrop = async (e, projectId, dropIndex) => {
    e.preventDefault();
    
    if (!draggedImage) return;

    const project = projects.find(p => p._id === projectId);
    if (!project || !project.images) return;

    const currentIndex = project.images.indexOf(draggedImage);
    if (currentIndex === -1 || currentIndex === dropIndex) {
      setDraggedImage(null);
      setDraggedOverIndex(null);
      return;
    }

    // Reorder images locally
    const items = Array.from(project.images);
    const [reorderedItem] = items.splice(currentIndex, 1);
    items.splice(dropIndex, 0, reorderedItem);

    // Update locally
    setProjects(projects.map(p => 
      p._id === projectId ? { ...p, images: items } : p
    ));

    // Update on server
    try {
      await api.patch(`/api/artisan/portfolio/projects/${projectId}/reorder`, {
        images: items
      });
      showToast('Images reordered successfully', 'success');
    } catch (error) {
      console.error('Error reordering images:', error);
      showToast('Failed to reorder images', 'error');
      fetchProjects(); // Revert on error
    }

    setDraggedImage(null);
    setDraggedOverIndex(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A55233]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Portfolio & Gallery</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Showcase your best work to attract customers
          </p>
        </div>
        <button
          onClick={() => setShowAddProject(true)}
          className="px-6 py-3 bg-[#A55233] text-white rounded-lg hover:bg-[#8e462b] transition-colors font-medium"
        >
          + Add Project
        </button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
          <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No portfolio projects yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start showcasing your work to attract more customers
          </p>
          <button
            onClick={() => setShowAddProject(true)}
            className="px-6 py-3 bg-[#A55233] text-white rounded-lg font-medium hover:bg-[#8e462b] transition-colors"
          >
            Create Your First Project
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {projects.map((project) => (
            <div key={project._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              {/* Project Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{project.title}</h3>
                  {project.description && (
                    <p className="text-gray-600 dark:text-gray-400 mt-1">{project.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                      {project.category}
                    </span>
                    <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                    <span>{project.images?.length || 0} images</span>
                    <span className={`px-2 py-1 rounded ${project.isPublic ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                      {project.isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.multiple = true;
                      input.accept = 'image/*';
                      input.onchange = (e) => handleImageUpload(Array.from(e.target.files), project._id);
                      input.click();
                    }}
                    disabled={uploadingImages}
                    className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    {uploadingImages ? 'Uploading...' : '+ Add Images'}
                  </button>
                  <button
                    onClick={() => deleteProject(project._id)}
                    className="px-4 py-2 text-sm text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 transition-colors"
                  >
                    Delete Project
                  </button>
                </div>
              </div>

              {/* Images Grid with Drag & Drop */}
              {project.images && project.images.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {project.images.map((image, index) => (
                    <div
                      key={image}
                      draggable
                      onDragStart={(e) => handleDragStart(e, image)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      onDrop={(e) => handleDrop(e, project._id, index)}
                      className={`relative group cursor-move ${draggedImage === image ? 'opacity-50' : ''} ${draggedOverIndex === index ? 'ring-2 ring-[#A55233]' : ''}`}
                    >
                      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                        <img
                          src={optimizeImage(image, { width: 200, height: 200 })}
                          alt={`Portfolio ${index + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      {/* Overlay Controls */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all rounded-lg flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        {project.coverImage !== image && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCoverImage(project._id, image);
                            }}
                            className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                            title="Set as cover"
                          >
                            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteImage(project._id, image);
                          }}
                          className="p-2 bg-white rounded-full hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      {/* Cover Badge */}
                      {project.coverImage === image && (
                        <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-semibold rounded">
                          Cover
                        </div>
                      )}
                      {/* Drag Handle Icon */}
                      <div className="absolute top-2 right-2 p-1 bg-white bg-opacity-80 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">No images in this project yet</p>
                  <button
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.multiple = true;
                      input.accept = 'image/*';
                      input.onchange = (e) => handleImageUpload(Array.from(e.target.files), project._id);
                      input.click();
                    }}
                    className="px-6 py-2 bg-[#A55233] text-white rounded-lg font-medium hover:bg-[#8e462b] transition-colors"
                  >
                    Upload Images
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Project Modal */}
      {showAddProject && (
        <AddProjectModal
          onClose={() => setShowAddProject(false)}
          onSubmit={createProject}
        />
      )}
    </div>
  );
};

// Add Project Modal Component
const AddProjectModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    isPublic: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.category) {
      alert('Title and category are required');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Create New Project</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Custom Pottery Collection 2025"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#A55233] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe this project..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#A55233] focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category *
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#A55233] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Select category</option>
              <option value="Pottery">Pottery</option>
              <option value="Weaving">Weaving</option>
              <option value="Jewelry">Jewelry</option>
              <option value="Woodwork">Woodwork</option>
              <option value="Painting">Painting</option>
              <option value="Sculpture">Sculpture</option>
              <option value="Textiles & Weaving">Textiles & Weaving</option>
              <option value="Pottery & Ceramics">Pottery & Ceramics</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isPublic}
                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                className="rounded text-[#A55233] focus:ring-[#A55233]"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Make this project public on my profile
              </span>
            </label>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-[#A55233] text-white rounded-lg font-medium hover:bg-[#8e462b] transition-colors"
            >
              Create Project
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PortfolioTab;
