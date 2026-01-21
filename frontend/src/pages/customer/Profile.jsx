// frontend/src/pages/customer/Profile.jsx
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { authAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { User, Mail, Phone, MapPin, Save } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

const CustomerProfile = () => {
  const { user } = useSelector((state) => state.auth)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || {
      street: '',
      city: '',
      state: '',
      pincode: ''
    }
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      await authAPI.updateProfile(formData)
      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-2">Manage your personal information</p>
      </div>

      <Card>
        <Card.Content>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center">
                <User className="h-10 w-10 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {user?.name}
                </h3>
                <p className="text-gray-600">{user?.email}</p>
                <p className="text-sm text-gray-500">Customer</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  icon={<User className="h-5 w-5 text-gray-400" />}
                />
              </div>
              
              <div>
                <div className="flex items-center text-sm text-gray-700 mb-1">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  Email
                </div>
                <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-600">
                  {user?.email}
                </div>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
            </div>

            <div>
              <Input
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                icon={<Phone className="h-5 w-5 text-gray-400" />}
              />
            </div>

            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-gray-400" />
                Address Information
              </h4>
              
              <div className="space-y-4">
                <Input
                  label="Street Address"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="City"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                  />
                  
                  <Input
                    label="State"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                  />
                </div>
                
                <Input
                  label="Pincode"
                  name="address.pincode"
                  value={formData.address.pincode}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <Button
                type="submit"
                loading={loading}
                className="flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </form>
        </Card.Content>
      </Card>
    </div>
  )
}

export default CustomerProfile